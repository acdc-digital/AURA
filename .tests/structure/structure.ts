#!/usr/bin/env node
// STRUCTURE EXECUTABLE - Main entry point for structure analysis system
// /Users/matthewsimon/Projects/AURA/AURA/app/tests/structure/structure.ts

import { StructureCLI } from "./structure-cli";

const main = async (): Promise<void> => {
  try {
    const cli = new StructureCLI();
    await cli.run(process.argv.slice(2));
  } catch (error) {
    console.error("Structure analysis failed:", error);
    process.exit(1);
  }
};

main();
