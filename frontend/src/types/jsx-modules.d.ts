/**
 * Module declarations for untyped JSX files in the src/jsx directory.
 * These allow TypeScript to resolve the imports without @ts-expect-error suppressions.
 */
declare module '*/jsx/AxiomApp' {
  import React from 'react';
  const AxiomModular: React.ComponentType;
  export default AxiomModular;
}

declare module '*/jsx/components/Marketing/VanguardLanding' {
  import React from 'react';
  const VanguardLanding: React.ComponentType;
  export default VanguardLanding;
}

declare module '*/jsx/components/Marketing/MicropageRenderer' {
  import React from 'react';
  const MicropageRenderer: React.ComponentType;
  export default MicropageRenderer;
}
