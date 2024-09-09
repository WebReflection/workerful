export const truthy = value => /^(?:1|y|ok|yes|true)$/i.test(value);

const { parse, stringify } = JSON;
export { parse, stringify };
