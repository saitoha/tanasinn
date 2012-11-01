
#import <Cocoa/Cocoa.h>
#import <QuickLook/QuickLook.h>

#define SIZE 96

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
    if (argc != 2)
        return -1;

    NSAutoreleasePool *pool = [[NSAutoreleasePool alloc] init];
    char buffer[PATH_MAX];

    NSString *inputFile = [NSString stringWithCString:realpath(*++argv, buffer)
                                             encoding:NSUTF8StringEncoding];
    CGImageRef thumbnailRef = QLThumbnailImageCreate(
            kCFAllocatorDefault, 
            (CFURLRef)[NSURL fileURLWithPath:inputFile], 
            NSMakeSize(SIZE, SIZE), 
            nil);

    NSImage *iconImage = nil;
    thumbnailRef = nil;
    if (!thumbnailRef) {
        iconImage = [[NSWorkspace sharedWorkspace] iconForFile:inputFile];
        iconImage = ResizeImage(iconImage, NSMakeSize(SIZE, SIZE));
    } else { 
        [iconImage = [[[NSImage alloc] init] autorelease] 
            addRepresentation:[[[NSBitmapImageRep alloc] autorelease]
              initWithCGImage:thumbnailRef]];
        CFRelease(thumbnailRef);
    }

    if (iconImage == nil)
        return -1;

    NSBitmapImageRep *rawImage = [NSBitmapImageRep imageRepWithData:[iconImage TIFFRepresentation]];
    rawImage = fillBackground(rawImage);
    NSDictionary *properties = [NSDictionary dictionaryWithObject:[NSNumber numberWithBool:YES]
                                                           forKey:NSImageInterlaced];

    NSData *data = [rawImage representationUsingType:NSPNGFileType 
                                          properties:properties];
    [data writeToFile:@"/dev/stdout"
           atomically:NO];
    [pool release];
    return 0;
}

