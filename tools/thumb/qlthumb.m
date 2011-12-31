
#import <Cocoa/Cocoa.h>
#import <QuickLook/QuickLook.h>

int main(int argc, char *argv[])
{
    if (argc < 2)
        return -1;
    NSAutoreleasePool *pool = [[NSAutoreleasePool alloc] init];
    char buffer[PATH_MAX];
    NSString *inputFile = [NSString stringWithCString:realpath(*++argv, buffer)
                                             encoding:NSUTF8StringEncoding];
    NSString *outputFile = [NSString stringWithCString:*++argv
                                              encoding:NSUTF8StringEncoding];
    CGImageRef thumbnailRef = QLThumbnailImageCreate(
            kCFAllocatorDefault, 
            (CFURLRef)[NSURL fileURLWithPath:inputFile], 
            NSMakeSize(512, 512), 
            nil);
    NSImage *iconImage = nil;
    if (!thumbnailRef) {
        iconImage = [[NSWorkspace sharedWorkspace] iconForFile: inputFile];
    } else { 
        [iconImage = [[[NSImage alloc] init] autorelease] 
            addRepresentation:[[[NSBitmapImageRep alloc] autorelease] initWithCGImage:thumbnailRef]];
        CFRelease(thumbnailRef);
    }
    if (nil == iconImage)
        return -1;
    [[[NSBitmapImageRep imageRepWithData:[iconImage TIFFRepresentation]] 
        representationUsingType:NSPNGFileType 
                     properties:[NSDictionary dictionaryWithObject:[NSNumber numberWithBool:true] 
                                                            forKey:NSImageInterlaced]] writeToFile:outputFile 
                                                                                        atomically:YES];
    [pool release];
    return 0;
}

