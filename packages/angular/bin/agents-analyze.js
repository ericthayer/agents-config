#!/usr/bin/env node
import { runAnalyze } from '@agents-config/core/analyze';
runAnalyze().catch(error => { console.error(error.message); process.exitCode = 1; });
