import React from 'react';
import { Link } from 'react-router-dom';

export default function ErrorReport() {
  return (
    <div className="w-full max-w-4xl mx-auto my-8 px-4">
      <div className="bg-[radial-gradient(var(--outline-variant)_1px,transparent_1px)] [background-size:16px_16px] p-6 rounded-2xl border border-outline-variant/30 text-center">
        <p className="font-body-md text-sm md:text-base text-on-surface-variant">
          Found an error in a study song or note?{' '}
          <Link to="/contact" className="text-blue-500 font-semibold hover:underline underline-offset-4">
            Report it here
          </Link>{' '}
          so we can review and correct it.
        </p>
      </div>
    </div>
  );
}
