const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
  testEnvironment: "node",
  // Prisma pode deixar handles abertos em alguns ambientes; forçamos saída no MVP.
  forceExit: true,
  transform: {
    ...tsJestTransformCfg,
  },
};