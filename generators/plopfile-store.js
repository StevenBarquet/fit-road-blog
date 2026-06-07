export default (plop) => {
  plop.setGenerator('component', {
    description: 'Create a component',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message:
          'Nombre de tu store con espacio si son multiples palabras (ejemplo: users, cart, app info)?'
      },
      {
        type: 'confirm',
        name: 'persist',
        message: 'Tu store persiste en dispositivo?',
        default: false
      }
    ],
    actions: ({ persist }) => {
      const storeType = persist ? 'persist' : '';

      const storeTemplate = {
        type: 'add',
        path: '../src/app/_store/{{camelCase name}}.ts',
        templateFile: `store/${storeType}Store.ts.hbs`
      };

      return [storeTemplate];
    }
  });
};
