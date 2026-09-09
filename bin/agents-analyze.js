#!/usr/bin/env node
import { runAnalyze } from '@agents-config/core/analyze';

runAnalyze().catch(error => {
  console.error(process.argv.includes('--verbose') || process.argv.includes('-v') ? error : error.message);
  process.exitCode = 1;
});
