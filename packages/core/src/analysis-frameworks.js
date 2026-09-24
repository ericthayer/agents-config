export function namingDefaults(stack = 'react') {
  if (stack === 'angular') return { componentStyle: 'kebab-case', fileExtension: '.ts', testNaming: '.spec.' };
  if (stack === 'vue') return { componentStyle: 'PascalCase', fileExtension: '.vue', testNaming: '.spec.' };
  return { componentStyle: 'PascalCase', fileExtension: '.tsx', testNaming: '.test.' };
}

export function guidedOptions(stack = 'react') {
  const composition = stack === 'angular' ? [
    'Standalone components with dependency injection',
    'Content projection with ng-content',
    'Directives and services for shared behavior',
    'Container/Presentational pattern',
  ] : stack === 'vue' ? [
    'Composition API with script setup',
    'Slots and scoped slots for customization',
    'Composables for shared logic',
    'Provide/inject for shared dependencies',
  ] : [
    'Compound components (Menu, Menu.Item, Menu.Trigger)',
    'Render props for customization',
    'Higher-order components (HOCs)',
    'Hooks for shared logic',
    'Container/Presentational pattern',
  ];
  return {
    composition: [...composition, 'None/Other'],
    errors: [
      stack === 'angular' ? 'ErrorHandler and template fallback states' :
        stack === 'vue' ? 'onErrorCaptured and fallback UI' : 'Error boundaries + fallback UI',
      'Toast notifications for errors',
      'Inline error messages',
      'Centralized error logging (Sentry, etc.)',
      'Custom error pages (404, 500)',
    ],
  };
}

const pattern = (tool, description, rules) => ({ tool, description, rules });

export function nativePatterns(stack, features = []) {
  if (stack === 'angular') {
    return {
      stateManagement: pattern(
        features.includes('NgRx') ? 'NgRx + Angular signals' : 'Angular signals + services',
        'Keep local state in signals and share domain state through injected services. Use APIs supported by the installed Angular version.',
        [
          'Use computed for derived signal state; reserve effects for side effects',
          'Keep asynchronous streams in RxJS and clean up subscriptions with lifecycle-aware APIs',
          'Use URL state for filters, tabs, and pagination',
        ],
      ),
      dataFetching: pattern('HttpClient + RxJS', 'Encapsulate HTTP requests in injected services.', [
        'Use typed HttpClient responses and explicit loading, error, and success states',
        'Use switchMap when newer requests should cancel older requests',
        'Keep transport concerns in services and interceptors rather than templates',
      ]),
      formHandling: pattern('Typed reactive forms', 'Use Angular reactive forms with types supported by the installed version.', [
        'Model controls with FormControl, FormGroup, and explicit validators',
        'Display validation messages near labeled controls',
        'Disable submission while pending and focus the first invalid control',
      ]),
      routing: pattern('Angular Router', 'Define routes and use routerLink for navigation.', [
        'Lazy-load route components where appropriate for the installed Angular version',
        'Keep filters and pagination in route query parameters',
        'Use guards for navigation UX, not as a replacement for server authorization',
      ]),
      componentComposition: pattern('Standalone components + dependency injection', 'Compose focused components using Angular APIs supported by the installed version.', [
        'Use typed component inputs and outputs for component contracts',
        'Use ng-content for content projection',
        'Move reusable behavior into directives and injected services',
      ]),
    };
  }
  if (stack === 'vue') {
    return {
      stateManagement: features.includes('Pinia')
        ? pattern('Pinia', 'Use Pinia for shared domain state and local refs for component state.', [
          'Keep stores focused on a domain',
          'Use storeToRefs when destructuring reactive store state',
          'Use URL state for filters, tabs, and pagination',
        ])
        : pattern('Vue ref/reactive', 'Use ref and reactive for local state and computed for derived values.', [
          'Extract reusable stateful logic into composables',
          'Use provide/inject for scoped dependencies',
          'Use URL state for filters, tabs, and pagination',
        ]),
      dataFetching: features.includes('TanStack Vue Query')
        ? pattern('TanStack Vue Query', 'Use @tanstack/vue-query for server state.', [
          'Keep query keys reactive and scoped to the requested resource',
          'Use useQuery for reads and useMutation for writes',
          'Expose pending and error states and invalidate related queries after mutations',
        ])
        : pattern('fetch + composables', 'Encapsulate API requests and reactive request state in composables.', [
          'Expose loading, error, and result refs to consumers',
          'Cancel stale requests and clean up on scope disposal',
          'Handle errors explicitly with inline or fallback UI',
        ]),
      formHandling: features.includes('VeeValidate')
        ? pattern('VeeValidate', 'Use the installed VeeValidate version for form state and validation.', [
          'Define explicit validation rules and typed form values',
          'Associate inline errors with labeled controls',
          'Disable submission while pending and focus the first invalid control',
        ])
        : pattern('v-model + reactive form state', 'Bind labeled form controls with v-model and validate explicitly.', [
          'Keep form values in refs or a reactive object',
          'Validate on blur and submit and expose inline errors',
          'Disable submission while pending and focus the first invalid control',
        ]),
      routing: pattern('Vue Router', 'Use Vue Router when installed; do not add routing to projects that do not need it.', [
        'Use RouterLink for navigation and RouterView for route content',
        'Keep filters and pagination in route query parameters',
        'Lazy-load route components and handle missing routes',
      ]),
      componentComposition: pattern('Vue SFCs + Composition API', 'Compose single-file components with script setup and typed contracts.', [
        'Use defineProps and defineEmits with types supported by the installed Vue version',
        'Use slots and scoped slots for customization',
        'Extract reusable state and lifecycle behavior into composables',
      ]),
    };
  }
  return null;
}
