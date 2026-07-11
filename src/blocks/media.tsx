import { CircleUser, Image as ImageIcon, Video } from 'lucide-react'
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
  render: ({ node, style }) => (
    <img src={node.props.src} alt={node.props.alt ?? ''} style={style} draggable={false} />
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
