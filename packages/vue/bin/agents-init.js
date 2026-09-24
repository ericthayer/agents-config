#!/usr/bin/env node
import { runInit } from '@agents-config/core/init';
runInit().catch(error => { console.error(error.message); process.exitCode = 1; });
