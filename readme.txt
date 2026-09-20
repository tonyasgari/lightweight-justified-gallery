=== Lightweight Justified Gallery ===
Contributors: galleryblock
Tags: gallery, block, gutenberg, justified gallery, images
Requires at least: 6.5
Tested up to: 6.6
Requires PHP: 7.4
Stable tag: 1.0.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

A lightweight native gallery block for automatic justified rows and manually composed diptychs, triptychs, and larger image rows.

== Description ==

Lightweight Justified Gallery adds one focused block to the WordPress editor. It preserves image proportions while aligning every image in a row to the same height.

Features:

* Automatic justified row packing with an adjustable target height.
* Manual row composition for deliberate diptychs, triptychs, and larger rows.
* Drag-and-drop image ordering in the editor.
* Keyboard-accessible move controls.
* Independent row and gutter spacing controls.
* Optional stretching for the last automatic row.
* Responsive WordPress image markup with no front-end JavaScript.
* No lightbox, links, settings pages, custom database tables, or external dependencies.

== Installation ==

1. In WordPress, open Plugins > Add New Plugin > Upload Plugin.
2. Select the plugin ZIP and choose Install Now.
3. Activate Lightweight Justified Gallery.
4. Add the Justified Gallery block to any post or page.

== Usage ==

1. Insert a Justified Gallery block and choose images from the Media Library.
2. Drag images to reorder them, or select an image and use its move buttons.
3. In the block settings, choose Automatic packing or Manual rows.
4. In Manual rows mode, select an image and use Start new row to create a new diptych, triptych, or larger grouping.
5. Adjust target row height, row spacing, and gutter spacing as needed.

== Frequently Asked Questions ==

= Does it crop images? =

No. Image proportions are preserved.

= Does it load JavaScript on the front end? =

No. The published gallery uses responsive WordPress image markup and CSS only.

= What happens if an image is deleted from the Media Library? =

Unavailable images are omitted safely from the published gallery.

== Changelog ==

= 1.0.0 =

* Initial release.
