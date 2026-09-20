<?php
/**
 * Server-side rendering for the Justified Gallery block.
 *
 * @package LightweightJustifiedGallery
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$images = isset( $attributes['images'] ) && is_array( $attributes['images'] ) ? $attributes['images'] : array();
if ( empty( $images ) ) {
	return;
}

$layout_mode      = isset( $attributes['layoutMode'] ) && 'manual' === $attributes['layoutMode'] ? 'manual' : 'automatic';
$target_height    = isset( $attributes['targetRowHeight'] ) ? max( 120, min( 600, absint( $attributes['targetRowHeight'] ) ) ) : 260;
$row_gap          = isset( $attributes['rowGap'] ) ? max( 0, min( 80, absint( $attributes['rowGap'] ) ) ) : 12;
$column_gap       = isset( $attributes['columnGap'] ) ? max( 0, min( 80, absint( $attributes['columnGap'] ) ) ) : 12;
$stretch_last_row = ! empty( $attributes['stretchLastRow'] );

$valid_images = array();
foreach ( $images as $image ) {
	$image_id = isset( $image['id'] ) ? absint( $image['id'] ) : 0;
	if ( ! $image_id || ! wp_attachment_is_image( $image_id ) ) {
		continue;
	}

	$metadata = wp_get_attachment_metadata( $image_id );
	$width    = isset( $metadata['width'] ) ? absint( $metadata['width'] ) : ( isset( $image['width'] ) ? absint( $image['width'] ) : 1 );
	$height   = isset( $metadata['height'] ) ? absint( $metadata['height'] ) : ( isset( $image['height'] ) ? absint( $image['height'] ) : 1 );

	$valid_images[] = array(
		'id'           => $image_id,
		'ratio'        => max( 0.1, min( 10, $width / max( 1, $height ) ) ),
		'break_before' => ! empty( $image['breakBefore'] ),
	);
}

if ( empty( $valid_images ) ) {
	return;
}

$wrapper_attributes = get_block_wrapper_attributes(
	array(
		'class' => 'ljg-block',
		'style' => sprintf(
			'--ljg-row-gap:%dpx;--ljg-column-gap:%dpx;--ljg-target-height:%dpx',
			$row_gap,
			$column_gap,
			$target_height
		),
	)
);

$render_item = static function ( $image ) {
	$image_html = wp_get_attachment_image(
		$image['id'],
		'large',
		false,
		array(
			'class'    => 'ljg-img',
			'loading'  => 'lazy',
			'decoding' => 'async',
		)
	);

	if ( ! $image_html ) {
		return '';
	}

	return sprintf(
		'<figure class="ljg-item ljg-image" style="--ljg-ratio:%s">%s</figure>',
		esc_attr( number_format( $image['ratio'], 6, '.', '' ) ),
		$image_html
	);
};
?>
<div <?php echo $wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?> role="group" aria-label="<?php esc_attr_e( 'Image gallery', 'lightweight-justified-gallery' ); ?>">
<?php if ( 'manual' === $layout_mode ) : ?>
	<?php
	$rows = array();
	foreach ( $valid_images as $index => $image ) {
		if ( 0 === $index || $image['break_before'] ) {
			$rows[] = array();
		}
		$rows[ count( $rows ) - 1 ][] = $image;
	}
	?>
	<div class="ljg-gallery ljg-gallery--manual">
		<?php foreach ( $rows as $row ) : ?>
			<div class="ljg-row">
				<?php foreach ( $row as $image ) : ?>
					<?php echo $render_item( $image ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
				<?php endforeach; ?>
			</div>
		<?php endforeach; ?>
	</div>
<?php else : ?>
	<div class="ljg-gallery ljg-gallery--automatic<?php echo $stretch_last_row ? ' ljg-stretch-last' : ''; ?>">
		<?php foreach ( $valid_images as $image ) : ?>
			<?php echo $render_item( $image ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
		<?php endforeach; ?>
	</div>
<?php endif; ?>
</div>
