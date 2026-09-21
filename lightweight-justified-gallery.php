<?php
/**
 * Plugin Name:       Lightweight Justified Gallery
 * Description:       A native gallery block with justified automatic and manually composed rows.
 * Version:           1.0.1
 * Requires at least: 6.5
 * Requires PHP:      7.4
 * Author:            Gallery Block
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       lightweight-justified-gallery
 *
 * @package LightweightJustifiedGallery
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Register the block and its assets.
 */
function ljg_register_block() {
	register_block_type( __DIR__ . '/block' );
}
add_action( 'init', 'ljg_register_block' );
