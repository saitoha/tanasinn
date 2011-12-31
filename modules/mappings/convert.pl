#!/usr/bin/env perl

my $file = shift @ARGV;

my ($name) = split(/\./, $file);

open(IN, $file) or die "cannnot open $file .";
print "({\n";
print qq(  name: "$name",\n);
print "  map: {\n";
for (<IN>) {
    if (m/^0x([0-9A-F]+)\s+0x([0-9A-F]+)/) {
        my $key = hex($1);
        my $value = "0x".$2;
        print "$key:$value,";
    }
}
print "  }\n";
print "})\n";
close(IN);

