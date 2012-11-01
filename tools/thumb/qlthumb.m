
#import <Cocoa/Cocoa.h>
#import <QuickLook/QuickLook.h>

NSBitmapImageRep * fillBackground(NSBitmapImageRep *bitmap_rep)
{
    NSImage *src_image = [[[NSImage alloc] init] autorelease];
    [src_image addRepresentation:bitmap_rep];
    NSSize image_size = [src_image size];
    NSImage *bg_image = [[[NSImage alloc] initWithSize:image_size] autorelease];
    [bg_image lockFocus];[[NSColor blackColor] set];
    [NSBezierPath fillRect:NSMakeRect(0, 0, image_size.width, image_size.height)];
    [src_image compositeToPoint:NSZeroPoint operation:NSCompositeSourceOver];
    [bg_image unlockFocus];
    NSBitmapImageRep* output = [[[NSBitmapImageRep alloc] initWithData:[bg_image TIFFRepresentation]] autorelease];
    return output;
}

NSImage *ResizeImage(NSImage *anImage, NSSize newSize)
{
    NSImage *workImage = [[NSImage alloc] initWithSize:newSize];
    NSSize oldSize = [anImage size];
    NSRect sourceRect = NSMakeRect(0, 0, oldSize.width, oldSize.height);
    NSRect destRect = NSMakeRect(0, 0, newSize.width, newSize.height);
    [workImage lockFocus];
    [anImage drawInRect:destRect
               fromRect:sourceRect
              operation:NSCompositeCopy
               fraction:1.0];
    [workImage unlockFocus];
    [workImage autorelease];
    return  workImage;
} 

int main(int argc, char *argv[])
{
    if (argc != 3)
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
            NSMakeSize(64, 64), 
            nil);

    NSImage *iconImage = nil;
    if (!thumbnailRef) {
        iconImage = ResizeImage([[NSWorkspace sharedWorkspace] iconForFile:inputFile]);
    } else { 
        [iconImage = [[[NSImage alloc] init] autorelease] 
            addRepresentation:[[[NSBitmapImageRep alloc] autorelease]
              initWithCGImage:thumbnailRef]];
        CFRelease(thumbnailRef);
    }

    if (iconImage == nil)
        return -1;

    NSBitmapImageRep *rawImage = [NSBitmapImageRep imageRepWithData:[iconImage TIFFRepresentation]];
//    unsigned char *rawData = [rawImage bitmapData];
//    
//    printf("len[%d][%d][%d]", [rawImage bitsPerPixel],
//                              [rawImage bytesPerPlane],
//                              [rawImage bytesPerRow]);
    rawImage = fillBackground(rawImage);
    [[rawImage representationUsingType:NSJPEGFileType 
                            properties:[NSDictionary dictionaryWithObject:[NSNumber numberWithBool:YES]
                                                                   forKey:NSImageInterlaced]] writeToFile:outputFile 
                                                                                                 atomically:YES];
    [pool release];
    return 0;
}

