#!/usr/bin/perl

my $input_file_name = shift() || "EastAsianWidth.txt";
my $function_name = shift() || "coUCS2EastAsianWidthTest";
open(IN, $input_file_name) or die("Cannot open '$input_file_name'.");
print "function $function_name(c) {return /[";
my $last = 0; 
my $previous = 0; 
my @array = [];
while (<IN>) {
    if ($_ =~ /^([0-9A-F]{4});(F|W|A)/) {
        my $current = $1;
        if (hex($current) - hex($previous) ne 1) {
            if ($last == $previous) {
                print "\\u$current";
                #print chr(hex($current));
            } elsif (hex($previous) - hex($last) <= 1) {
                print "\\u$previous\\u$current";
                #print chr(hex($previous)), chr(hex($current));
            } else {
                print "-\\u$previous\\u$current";
                #print "-", chr(hex($previous)), chr(hex($current));
            }
            $last = $current;
        }
        $previous = $current;
    } elsif ($_ =~ /^([0-9A-F]{4})\.\.([0-9A-F]+);(F|W|A)/) {
        my $current = $1;
        if (hex($current) - hex($previous) ne 1) {
            if ($last == $previous) {
                print "\\u$current";
            } else {
                printf "-\\u$previous\\u$current";
            }
            $last = $current;
        }
        $previous = $2;
    }
}
print ']';
print '/.test(c);}', "\n";
close(IN);

