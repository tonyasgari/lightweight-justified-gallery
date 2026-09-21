(function (wp) {
	'use strict';

	var el = wp.element.createElement;
	var Fragment = wp.element.Fragment;
	var useState = wp.element.useState;
	var useRef = wp.element.useRef;
	var useBlockProps = wp.blockEditor.useBlockProps;
	var MediaUpload = wp.blockEditor.MediaUpload;
	var MediaUploadCheck = wp.blockEditor.MediaUploadCheck;
	var InspectorControls = wp.blockEditor.InspectorControls;
	var BlockControls = wp.blockEditor.BlockControls;
	var Button = wp.components.Button;
	var PanelBody = wp.components.PanelBody;
	var RangeControl = wp.components.RangeControl;
	var ToggleControl = wp.components.ToggleControl;
	var ToolbarGroup = wp.components.ToolbarGroup;
	var ToolbarButton = wp.components.ToolbarButton;
	var SelectControl = wp.components.SelectControl;
	var Notice = wp.components.Notice;
	var __ = wp.i18n.__;

	function normalizeMedia(media, existing) {
		var prior = existing || {};
		var sizes = media.sizes || {};
		var preview = sizes.large || sizes.medium_large || sizes.medium || {};
		var width = Number(media.width || preview.width || prior.width || 1);
		var height = Number(media.height || preview.height || prior.height || 1);
		return {
			id: Number(media.id),
			url: preview.url || media.url || prior.url || '',
			alt: media.alt || prior.alt || '',
			width: width > 0 ? width : 1,
			height: height > 0 ? height : 1,
			breakBefore: Boolean(prior.breakBefore)
		};
	}

	function moveItem(items, from, to) {
		if (from === to || from < 0 || to < 0 || from >= items.length || to >= items.length) {
			return items;
		}
		var copy = items.slice();
		var moved = copy.splice(from, 1)[0];
		copy.splice(to, 0, moved);
		if (copy.length) {
			copy[0] = Object.assign({}, copy[0], { breakBefore: false });
		}
		return copy;
	}

	function GalleryEdit(props) {
		var attributes = props.attributes;
		var setAttributes = props.setAttributes;
		var images = Array.isArray(attributes.images) ? attributes.images : [];
		var layoutMode = attributes.layoutMode === 'manual' ? 'manual' : 'automatic';
		var selectedState = useState(null);
		var selectedIndex = selectedState[0];
		var setSelectedIndex = selectedState[1];
		var dragState = useState(null);
		var draggedIndex = dragState[0];
		var setDraggedIndex = dragState[1];
		var overState = useState(null);
		var dragOverIndex = overState[0];
		var setDragOverIndex = overState[1];
		var dragFromRef = useRef(null);

		function endDrag() {
			dragFromRef.current = null;
			setDraggedIndex(null);
			setDragOverIndex(null);
		}

		function updateImages(nextImages) {
			setAttributes({ images: nextImages });
		}

		function onSelectMedia(selection) {
			var selected = Array.isArray(selection) ? selection : [selection];
			var existingById = {};
			images.forEach(function (image) { existingById[image.id] = image; });
			updateImages(selected.map(function (media) {
				return normalizeMedia(media, existingById[media.id]);
			}));
		}

		function removeImage(index) {
			var next = images.filter(function (_, itemIndex) { return itemIndex !== index; });
			if (next.length) {
				next[0] = Object.assign({}, next[0], { breakBefore: false });
			}
			updateImages(next);
			setSelectedIndex(null);
		}

		function toggleBreak(index) {
			if (index === 0) { return; }
			updateImages(images.map(function (image, itemIndex) {
				return itemIndex === index
					? Object.assign({}, image, { breakBefore: !image.breakBefore })
					: image;
			}));
		}

		function reorder(from, to) {
			updateImages(moveItem(images, from, to));
			setSelectedIndex(to);
		}

		var blockProps = useBlockProps({
			className: 'ljg-editor ljg-mode-' + layoutMode + (attributes.stretchLastRow ? ' ljg-stretch-last' : ''),
			style: {
				'--ljg-row-gap': attributes.rowGap + 'px',
				'--ljg-column-gap': attributes.columnGap + 'px',
				'--ljg-target-height': attributes.targetRowHeight + 'px'
			}
		});

		var mediaButton = function (open) {
			return el(Button, {
				variant: images.length ? 'secondary' : 'primary',
				onClick: open
			}, images.length ? __('Edit images', 'lightweight-justified-gallery') : __('Choose images', 'lightweight-justified-gallery'));
		};

		return el(Fragment, {},
			el(InspectorControls, {},
				el(PanelBody, { title: __('Gallery layout', 'lightweight-justified-gallery') },
					el(SelectControl, {
						label: __('Row composition', 'lightweight-justified-gallery'),
						value: layoutMode,
						options: [
							{ label: __('Automatic packing', 'lightweight-justified-gallery'), value: 'automatic' },
							{ label: __('Manual rows', 'lightweight-justified-gallery'), value: 'manual' }
						],
						onChange: function (value) { setAttributes({ layoutMode: value }); }
					}),
					layoutMode === 'automatic' && el(RangeControl, {
						label: __('Target row height', 'lightweight-justified-gallery'),
						value: attributes.targetRowHeight,
						min: 120,
						max: 600,
						step: 10,
						onChange: function (value) { setAttributes({ targetRowHeight: value }); }
					}),
					layoutMode === 'automatic' && el(ToggleControl, {
						label: __('Stretch final row', 'lightweight-justified-gallery'),
						checked: attributes.stretchLastRow,
						onChange: function (value) { setAttributes({ stretchLastRow: value }); }
					}),
					el(RangeControl, {
						label: __('Row spacing', 'lightweight-justified-gallery'),
						value: attributes.rowGap,
						min: 0,
						max: 80,
						onChange: function (value) { setAttributes({ rowGap: value }); }
					}),
					el(RangeControl, {
						label: __('Gutter spacing', 'lightweight-justified-gallery'),
						value: attributes.columnGap,
						min: 0,
						max: 80,
						onChange: function (value) { setAttributes({ columnGap: value }); }
					})
				)
			),
			el(BlockControls, {},
				el(ToolbarGroup, {},
					el(MediaUploadCheck, {},
						el(MediaUpload, {
							onSelect: onSelectMedia,
							allowedTypes: ['image'],
							multiple: true,
							gallery: true,
							value: images.map(function (image) { return image.id; }),
							render: function (mediaProps) {
								return el(ToolbarButton, {
									icon: 'edit',
									label: __('Edit images', 'lightweight-justified-gallery'),
									onClick: mediaProps.open
								});
							}
						})
					)
				)
			),
			el('div', blockProps,
				!images.length
					? el(MediaUploadCheck, {},
						el('div', { className: 'ljg-placeholder' },
							el('span', { className: 'dashicons dashicons-format-gallery', 'aria-hidden': 'true' }),
							el('h3', {}, __('Justified Gallery', 'lightweight-justified-gallery')),
							el('p', {}, __('Build aligned image rows with flexible spacing.', 'lightweight-justified-gallery')),
							el(MediaUpload, {
								onSelect: onSelectMedia,
								allowedTypes: ['image'],
								multiple: true,
								gallery: true,
								render: function (mediaProps) { return mediaButton(mediaProps.open); }
							})
						)
					)
					: el('div', {
						className: 'ljg-gallery',
						role: 'list',
						'aria-label': __('Gallery images. Drag to reorder.', 'lightweight-justified-gallery')
					}, images.map(function (image, index) {
						var ratio = image.width && image.height ? image.width / image.height : 1;
						return el(Fragment, { key: image.id || index },
							layoutMode === 'manual' && image.breakBefore && el('div', {
								className: 'ljg-manual-break',
								'aria-hidden': 'true'
							}, el('span', {}, __('New row', 'lightweight-justified-gallery'))),
							el('div', {
								className: 'ljg-item'
									+ (selectedIndex === index ? ' is-selected' : '')
									+ (draggedIndex === index ? ' is-dragging' : '')
									+ (dragOverIndex === index && draggedIndex !== null && draggedIndex !== index
										? (draggedIndex < index ? ' is-drop-after' : ' is-drop-before')
										: ''),
								style: { '--ljg-ratio': ratio },
								role: 'listitem',
								tabIndex: 0,
								draggable: true,
								onClick: function () { setSelectedIndex(index); },
								onFocus: function () { setSelectedIndex(index); },
								onDragStart: function (event) {
									event.stopPropagation();
									dragFromRef.current = index;
									setDraggedIndex(index);
									setSelectedIndex(index);
									if (event.dataTransfer) {
										event.dataTransfer.effectAllowed = 'move';
										try {
											event.dataTransfer.setData('text/ljg-index', String(index));
											event.dataTransfer.setData('text/plain', String(index));
										} catch (error) {
											// Some browsers restrict custom types; the ref fallback covers it.
										}
									}
								},
								onDragEnter: function (event) {
									if (dragFromRef.current === null) { return; }
									event.preventDefault();
									event.stopPropagation();
									setDragOverIndex(index);
								},
								onDragOver: function (event) {
									if (dragFromRef.current === null) { return; }
									event.preventDefault();
									event.stopPropagation();
									if (event.dataTransfer) { event.dataTransfer.dropEffect = 'move'; }
									if (dragOverIndex !== index) { setDragOverIndex(index); }
								},
								onDragLeave: function (event) {
									event.stopPropagation();
								},
								onDrop: function (event) {
									var from = dragFromRef.current;
									if (from === null && event.dataTransfer) {
										var raw = event.dataTransfer.getData('text/ljg-index') || event.dataTransfer.getData('text/plain');
										if (raw !== '' && !isNaN(Number(raw))) { from = Number(raw); }
									}
									if (from === null || from === undefined) { return; }
									event.preventDefault();
									event.stopPropagation();
									if (from !== index) { reorder(from, index); }
									endDrag();
								},
								onDragEnd: function (event) {
									event.stopPropagation();
									endDrag();
								}
							},
								el('img', { src: image.url, alt: image.alt || '', draggable: false }),
								selectedIndex === index && el('div', { className: 'ljg-item-actions' },
									el(Button, {
										icon: 'arrow-left-alt2',
										label: __('Move image left', 'lightweight-justified-gallery'),
										disabled: index === 0,
										onClick: function (event) { event.stopPropagation(); reorder(index, index - 1); }
									}),
									el(Button, {
										icon: 'arrow-right-alt2',
										label: __('Move image right', 'lightweight-justified-gallery'),
										disabled: index === images.length - 1,
										onClick: function (event) { event.stopPropagation(); reorder(index, index + 1); }
									}),
									layoutMode === 'manual' && index > 0 && el(Button, {
										icon: image.breakBefore ? 'editor-join' : 'editor-break',
										label: image.breakBefore ? __('Join previous row', 'lightweight-justified-gallery') : __('Start new row', 'lightweight-justified-gallery'),
										onClick: function (event) { event.stopPropagation(); toggleBreak(index); }
									}),
									el(Button, {
										icon: 'trash',
										label: __('Remove image', 'lightweight-justified-gallery'),
										isDestructive: true,
										onClick: function (event) { event.stopPropagation(); removeImage(index); }
									})
								)
							)
						);
					})),
				images.some(function (image) { return !image.url; }) && el(Notice, { status: 'warning', isDismissible: false },
					__('One or more images are unavailable. Remove or replace them before publishing.', 'lightweight-justified-gallery')
				)
			)
		);
	}

	wp.blocks.registerBlockType('lightweight-justified-gallery/gallery', {
		edit: GalleryEdit,
		save: function () { return null; }
	});
})(window.wp);
