#!/usr/bin/perl

local $input_file_name = shift() || "EastAsianWidth.txt";
local $function_name = shift() || "coUCS2EastAsianWidthTest";


print "var EXPORTED_SYMBOLS=['$function_name', '$ambiguous_detector_name'];", "\n";

open(IN, $input_file_name) or die("Cannot open '$input_file_name'.");
print "function $function_name(c) {return /[";
while (<IN>) {
    if ($_ =~ /^([0-9A-F]{4});(F|W)/) {
        printf("\\u$1");
    } elsif ($_ =~ /^([0-9A-F]{4})\.\.([0-9A-F]+);(F|W)/) {
        print "\\u$1-\\u$2";
    }
}
print ']/.test(c);}', "\n";
close(IN);

