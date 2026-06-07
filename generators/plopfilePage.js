export default (plop) => {
  plop.setGenerator('component', {
    description: 'Create a component',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'Nombre de tus componentes? (ex: Home, Products, Blog)'
      },
      {
        type: 'input',
        name: 'url',
        message:
          'Nombre de la url omitiendo "/" inicial o final? (ex: products = /productos | blog/top-recomendaciones = /blog/top-recomendaciones )'
      },
      {
        type: 'confirm',
        name: 'auth',
        message: 'Tu page requiere Autenticacion?',
        default: false
      }
    ],
    actions: ({ auth }) => {
      const authType = auth ? 'Auth' : '';
      const pageTemplate = {
        type: 'add',
        path: '../src/app/(pages)/{{url}}/page.tsx',
        templateFile: `pages/page.jsx.hbs`
      };

      const containerTemplate = {
        type: 'add',
        path: '../src/app/(pages)/{{url}}/_container/{{pascalCase name}}.tsx',
        templateFile: `pages/container${authType}.tsx.hbs`
      };

      const stylesTemplate = {
        type: 'add',
        path: '../src/app/(pages)/{{url}}/_container/{{pascalCase name}}.module.scss',
        templateFile: `pages/styles.module.scss.hbs`
      };

      const actions = [pageTemplate, containerTemplate, stylesTemplate];

      return actions;
    }
  });
};
