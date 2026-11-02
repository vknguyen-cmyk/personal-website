/**
 * Full Motion Laboratory (`/lab.html`) — single-policy clip tracking.
 *
 * One pretrained `policy.onnx` tracks browsable reference clips. Switching
 * motions swaps the reference stream only; the ONNX session stays loaded.
 * Query: `?clip=<id>&chrome=minimal|full`.
 */

import { bootDemoPage } from './live-demo';

bootDemoPage({ kind: 'tracking' });
