export const mockData = {
  'loose-envify': {
    version: '1.4.0',
    dependencies: {
      'js-tokens': {
        version: '4.0.0',
        dependencies: {},
      },
    },
  },
  'object-assign': {
    version: '4.1.1',
    dependencies: {},
  },
  'prop-types': {
    version: '15.8.1',
    dependencies: {
      'object-assign': {
        version: '4.1.1',
        dependencies: {},
      },
      'loose-envify': {
        version: '1.4.0',
        dependencies: {
          'js-tokens': {
            version: '4.0.0',
            dependencies: {},
          },
        },
      },
      'react-is': {
        version: '16.13.1',
        dependencies: {},
      },
    },
  },
};

export const CycleMock = {
  'loose-envify': {
    version: '1.4.0',
    dependencies: {
      'loose-envify': {
        version: '1.4.0',
        dependencies: {},
      },
    },
  },
};
