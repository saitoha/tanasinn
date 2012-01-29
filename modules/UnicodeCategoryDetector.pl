#!/usr/bin/perl

my $input_file_name = shift() || "UnicodeData.txt";
my $function_name = shift() || "coUCS2UnicodeCategoryDetector";
print "coUtils.Unicode.detectCategory = ";
print "function detectCategory(c) {return c.match(/";
print "([";
printCategory->("Mn"); # mark, nonspacing, NonSpacingMark 
print "])|([";
printCategory->("Mc"); # mark, spacing combining, SpacingCombiningMark
print "])|([";
printCategory->("Me"); # mark, enclosing, EnclosingMark 
print "])|([";
printCategory->("Sk"); # symbol, modifier, ModifierSymbol 
print "])|([";
printCategory->("Cf"); # other, format, Format
print "])";
print '/);}', "\n";

sub printCategory {
    my $category = shift();
    open(IN, $input_file_name) or die("Cannot open '$input_file_name'.");
    my $last = 0; 
    my $previous = 0; 
    my @array = [];
    while (<IN>) {
        if ($_ =~ /^([0-9A-F]{4});[^;]*;($category)/) {
            my $current = $1;
    #        print "\ncurrent=$current, last=$last, previous=$previous, $_\n";
            if (hex($current) - hex($previous) ne 1) {
                if ($last eq $previous) {
                    print "\\u$current";
                } else {
                    if (hex($previous) - hex($last) > 1) {
                        print "-";
                    }
                    print "\\u$previous\\u$current";
                }
                $last = $current;
            }
            $previous = $current;
        };
    }
    if ($last ne $current) {
        if (hex($previous) - hex($last) > 1) {
            print "-";
        }
        print "\\u$previous";
    }
    close(IN);
}
