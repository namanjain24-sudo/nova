import { Image as ImageIcon } from 'lucide-react'
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
