import { CircleUser, Hexagon, Image as ImageIcon, Video } from 'lucide-react'
import { makeNode, registerBlock } from '../core/schema'

registerBlock({
  type: 'image',
  name: 'Image',
  category: 'media',
  icon: ImageIcon,
  keywords: ['picture', 'photo', 'img'],
  inspector: ['size', 'spacing', 'border', 'effects'],
  fields: [
    { key: 'src', label: 'Image URL', type: 'image', placeholder: 'https://…' },
    { key: 'alt', label: 'Alt text', type: 'text', placeholder: 'Description' },
    { key: 'lightbox', label: 'Click to zoom (lightbox)', type: 'boolean' },
  ],
  create: () =>
    makeNode(
      'image',
      {
        src: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&q=80',
        alt: 'Placeholder',
      },
      {
        display: 'block',
        width: '100%',
        maxWidth: '100%',
        height: 'auto',
        borderRadius: '16px',
        objectFit: 'cover',
      },
    ),
  render: ({ node, style, editMode }) => {
    const lb = !editMode && node.props.lightbox
    return (
      <img
        src={node.props.src}
        alt={node.props.alt ?? ''}
        style={lb ? { cursor: 'zoom-in', ...style } : style}
        draggable={false}
        {...(lb ? { 'data-nv-lightbox': '' } : {})}
      />
    )
  },
})

registerBlock({
  type: 'logo',
  name: 'Logo',
  category: 'media',
  icon: Hexagon,
  keywords: ['brand', 'mark', 'wordmark', 'company'],
  inspector: ['size', 'spacing', 'effects'],
  fields: [
    { key: 'src', label: 'Logo image', type: 'image', placeholder: 'Upload your logo' },
    { key: 'alt', label: 'Brand name', type: 'text', placeholder: 'Your brand' },
  ],
  create: () =>
    makeNode(
      'logo',
      { src: '', alt: 'Your Brand' },
      { display: 'block', height: '34px', width: 'auto', objectFit: 'contain' },
    ),
  render: ({ node, style }) =>
    node.props.src ? (
      <img src={node.props.src} alt={node.props.alt ?? ''} style={style} draggable={false} />
    ) : (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          fontSize: '22px',
          fontWeight: 800,
          letterSpacing: '-0.01em',
          color: '#0f172a',
          ...style,
          height: undefined,
        }}
      >
        {node.props.alt || 'Your Brand'}
      </span>
    ),
})

registerBlock({
  type: 'avatar',
  name: 'Avatar',
  category: 'media',
  icon: CircleUser,
  keywords: ['profile', 'user', 'headshot', 'photo'],
  inspector: ['size', 'spacing', 'border', 'effects'],
  fields: [
    { key: 'src', label: 'Image URL', type: 'image', placeholder: 'https://…' },
    { key: 'alt', label: 'Alt text', type: 'text', placeholder: 'Name' },
  ],
  create: () =>
    makeNode(
      'avatar',
      {
        src: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80',
        alt: 'Avatar',
      },
      {
        display: 'block',
        width: '56px',
        height: '56px',
        borderRadius: '999px',
        objectFit: 'cover',
      },
    ),
  render: ({ node, style }) => (
    <img src={node.props.src} alt={node.props.alt ?? ''} style={style} draggable={false} />
  ),
})

registerBlock({
  type: 'video',
  name: 'Video',
  category: 'media',
  icon: Video,
  keywords: ['embed', 'youtube', 'iframe', 'player'],
  inspector: ['size', 'spacing', 'border', 'effects'],
  fields: [
    {
      key: 'src',
      label: 'Embed URL',
      type: 'url',
      placeholder: 'https://www.youtube.com/embed/…',
    },
  ],
  create: () =>
    makeNode(
      'video',
      { src: 'https://www.youtube.com/embed/ScMzIvxBSi4' },
      {
        display: 'block',
        width: '100%',
        aspectRatio: '16 / 9',
        borderRadius: '16px',
        overflow: 'hidden',
        border: 'none',
      },
    ),
  render: ({ node, style, editMode }) => (
    <div style={{ position: 'relative', ...style }}>
      <iframe
        src={node.props.src}
        title="Embedded video"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          display: 'block',
          pointerEvents: editMode ? 'none' : 'auto',
        }}
      />
    </div>
  ),
})
