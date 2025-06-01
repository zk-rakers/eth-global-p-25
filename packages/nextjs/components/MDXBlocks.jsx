// components/YourMDXBlocks.jsx

export const MyTitle = ({ children }) => (
    <h2 className="text-xl font-bold text-blue-700 my-2">{children}</h2>
  );
  
  export const Description = ({ children }) => (
    <p className="text-gray-700 leading-relaxed my-2">{children}</p>
  );
  
  export const Error = ({ children }) => (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded my-2">
      {children}
    </div>
  );
  