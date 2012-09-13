#!/usr/bin/perl

use strict;
my %wcmap1;
my %wcmap2;

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
}

close(IN);

open(IN, "UnicodeData.txt") or die;
while (<IN>) {
    # Mark Nonspacing / Mark, Enclosing / Other, format
    if ($_ =~ /^([0-9A-F]{4});[^;]*;(Mn|Me|Cf)/) { 
        $wcmap1{$1} = 0;
        $wcmap2{$1} = 0;
    }
}
close(IN);

sub print_characters {
    my ($s, %wcmap) = @_;
    my $last = 0;
    my $previous = 0;
    my @results = ();
    foreach (sort keys %wcmap) {
        if ($wcmap{$_} == $s) {
            my $current = hex $_;
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


function wcwidth_amb_as_single(c) 
{
    if (c < 0x10000) {
        var s = String.fromCharCode(c);
        if (/[@{[print_characters 2, %wcmap1]}]/.test(s)) {
            return 2;
        } else if (/[@{[print_characters 0, %wcmap1]}]/.test(s)) {
            return 0;
        }
    } else if (c < 0x1F100) {
        return 1;
    } else if (c < 0x1F300) {
        switch (c) {
            case 0x1F12E:
            case 0x1F16A:
            case 0x1F16B:
            case 0x1F1E6:
            case 0x1F1E7:
            case 0x1F1E8:
            case 0x1F1E9:
            case 0x1F1EA:
            case 0x1F1EB:
            case 0x1F1EC:
            case 0x1F1ED:
            case 0x1F1EE:
            case 0x1F1EF:
            case 0x1F1F0:
            case 0x1F1F1:
            case 0x1F1F2:
            case 0x1F1F3:
            case 0x1F1F4:
            case 0x1F1F5:
            case 0x1F1F6:
            case 0x1F1F7:
            case 0x1F1F8:
            case 0x1F1F9:
            case 0x1F1FA:
            case 0x1F1FB:
            case 0x1F1FC:
            case 0x1F1FD:
            case 0x1F1FE:
            case 0x1F1FF:
                return 1;
        }
        return 2;
    } else if (c < 0x20000) {
        return 1;
    } else if (c < 0xE0000) {
        return 2;
    } else if (c < 0xE1000) {
        return 1;
    } else if (c > 0xFFFFF) {
        return 1;
    }
    return 1;
} 

function wcwidth_amb_as_double(c) 
{
    if (c < 0x10000) {
        var s = String.fromCharCode(c);
        if (/[@{[print_characters 2, %wcmap2]}]/.test(s)) {
            return 2;
        } else if (/[@{[print_characters 0, %wcmap2]}]/.test(s)) {
            return 0;
        }
    } else if (c < 0x1F200) {
        return 1;
    } else if (c < 0x1F200) {
        return 2;
    } else if (c < 0x1F300) {
        return 2;
    } else if (c < 0x20000) {
        return 1;
    } else if (c < 0xE0000) {
        return 2;
    } else if (c > 0xFFFFF) {
        return 2;
    }
    return 2;
}

EOF

