#!/usr/bin/perl

use strict;
my %wcmap1;
my %wcmap2;
my %wclmap1;
my %wclmap2;

open(IN, "EastAsianWidth.txt") or die;

while (<IN>) {
    if ($_ =~ /^([0-9A-F]{4});(F|W)/) {
        $wcmap1{$1} = 2;
    } elsif ($_ =~ /^([0-9A-F]{4})\.\.([0-9A-F]{4});(F|W)/) {
        my $first = hex $1;
        my $last = hex $2;
        for (my $i = $first; $i <= $last; $i++) {
            $wcmap1{sprintf("%04x", $i)} = 2;
        }
    }
    if ($_ =~ /^([0-9A-F]{4});(F|W|A)/) {
        my $key = $1;
        $wcmap2{$key} = 2;
    } elsif ($_ =~ /^([0-9A-F]{4})\.\.([0-9A-F]{4});(F|W|A)/) {
        my $first = hex $1;
        my $last = hex $2;
        for (my $i = $first; $i <= $last; $i++) {
            $wcmap2{sprintf("%04x", $i)} = 2;
        }
    }

#    if ($_ =~ /^([0-9A-F]{5});(F|W)/) {
#        my $n = hex $1;
#        my $first = sprintf "%04x", (($n >> 10) + 0xD800);
#        my $second = sprintf "%04x", (($n & 0x3ff) + 0xDC00);
#        $wclmap1{$first+""}{$second+""} = 2;
#    } elsif ($_ =~ /^([0-9A-F]{5})\.\.([0-9A-F]{5});(F|W)/) {
#        my $begin = hex $1;
#        my $end = hex $2;
#        for (my $i = $begin; $i <= $end; $i++) {
#            my $first = sprintf "%04x", (($i >> 10) + 0xD800);
#            my $second = sprintf "%04X", (($i & 0x3ff) + 0xDC00);
#            $wclmap1{$first+""}{$second+""} = 2;
#        }
#    }
#    if ($_ =~ /^([0-9A-F]{5});(F|W|A)/) {
#        my $n = hex $1;
#        my $first = sprintf "%04x", (($n >> 10) + 0xD800);
#        my $second = sprintf "%04x", (($n & 0x3ff) + 0xDC00);
#        $wclmap2{$first+""}{$second+""} = 2;
#    } elsif ($_ =~ /^([0-9A-F]{5})\.\.([0-9A-F]{5});(F|W|A)/) {
#        my $begin = hex $1;
#        my $last = hex $2;
#        for (my $i = $begin; $i <= $last; $i++) {
#            my $first = sprintf "%04x", (($i >> 10) + 0xD800);
#            my $second = sprintf "%04x", (($i & 0x3ff) + 0xDC00);
#            $wclmap2{$first+""}{$second+""} = 2;
#        }
#    }

}

close(IN);

open(IN, "UnicodeData.txt") or die;
while (<IN>) {
    # Mark Nonspacing / Mark, Enclosing / Other, format
    if ($_ =~ /^00AD;/) {
        next;
    }
    if ($_ =~ /^([0-9A-F]{4});[^;]*;(Mn|Me|Cf)/
     || $_ =~ /^11[6-9A-F][0-9A-F];/
     || $_ =~ /^200B;/ )
    {
        $wcmap1{$1} = 0;
        $wcmap2{$1} = 0;
    }
#    if ($_ =~ /^([0-9A-F]{5});[^;]*;(Mn|Me|Cf)/) {
#        my $n = hex $1;
#        my $first = sprintf "%04x", (($n >> 10) + 0xD800);
#        my $second = sprintf "%04x", (($n & 0x3ff) + 0xDC00);
#        $wclmap1{$first}{$second} = 0;
#        $wclmap2{$first}{$second} = 0;
#    }
}
close(IN);

sub print_characters {
    my ($s, %wcmap) = @_;
    my $last = 0;
    my $previous = 0;
    my @results = ();
    foreach (sort keys %wcmap) {
        if (ref($wcmap{$_}) ne "HASH") {
            my $current = hex $_;
            if ($wcmap{$_} == $s) {
                if ($previous == $current - 1) {
                    # pass
                } else {
                    if ($last == $previous) {
                        push @results, sprintf("\\u%04x", $current);
                        $last = $current;
                    } elsif ($previous - $last <= 1) {
                        push @results, sprintf("\\u%04x\\u%04x", $previous, $current);
                        $last = $current;
                    } else {
                        push @results, sprintf("-\\u%04x\\u%04x", $previous, $current);
                        $last = $current;
                    }
                }
                $previous = $current;
            }
        } else {
            my $first = $_;
            my $seconds = &print_characters($s, %{$wcmap{$first}});
            if (length($seconds) > 0) {
                if (length($seconds) < 8) {
                    push(@results, sprintf "|\\u%s%s", $first, $seconds);
                } else {
                    push(@results, sprintf "|\\u%s[%s]", $first, $seconds);
                }
            }
        }
    }
    return join "", @results;
}
print <<EOF;
/* -*- Mode: JAVASCRIPT; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 4 -*-
 *
 * ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is tanasinn
 *
 * The Initial Developer of the Original Code is * Hayaki Saito.
 * Portions created by the Initial Developer are Copyright (C) 2010 - 2011
 * the Initial Developer. All Rights Reserved.
 *
 * ***** END LICENSE BLOCK ***** */

"use strict";

function wcwidth_amb_as_single(c)
{
    if (c < 0x10000) {
        var s = String.fromCharCode(c);
        if (/^[@{[print_characters 2, %wcmap1]}]\$/.test(s)) {
            return 2;
        } else if (/^[@{[print_characters 0, %wcmap1]}]\$/.test(s)) {
            return 0;
        }
    } else if (c < 0x1F200) {
        return 1;
    } else if (c < 0x1F300) {
        return 2;
    } else if (c < 0x20000) {
        return 1;
    } else if (c < 0xE0000) {
        return 2;
    }
    return 1;
}

function wcwidth_amb_as_double(c)
{
    if (c < 0x10000) {
        var s = String.fromCharCode(c);
        if (/^[@{[print_characters 2, %wcmap2]}]\$/.test(s)) {
            return 2;
        } else if (/^[@{[print_characters 0, %wcmap2]}]\$/.test(s)) {
            return 0;
        }
    } else if (c < 0x1F100) {
        return 1;
    } else if (c < 0x1F1A0) {
        if (c == 0x1F12E) {
            return 1;
        } else if (c == 0x1F16A) {
            return 1;
        } else if (c == 0x1F16B) {
            return 1;
        }
        return 2;
    } else if (c < 0x1F200) {
        return 1;
    } else if (c < 0x1F300) {
        return 2;
    } else if (c < 0x20000) {
        return 1;
    }
    return 2;
}

EOF

