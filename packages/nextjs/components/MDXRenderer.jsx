// components/MDXRenderer.jsx
import { MDXRemote } from 'next-mdx-remote';
import { MyTitle, Description, Error } from './MDXBlocks';

const components = { MyTitle, Description, Error };

export default function MDXRenderer({ source }) {
  return (
    <div className="prose">
      <MDXRemote {...source} components={components} />
    </div>
  );
}
