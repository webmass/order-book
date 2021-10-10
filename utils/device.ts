// very simple function to estimate device perf
// TODO : find more precise solution
export const estimateDevicePerfLatency = (): number => {
    const start = performance.now();
    for(let i =0 ; i < 100000; i++) {
       //
    }
    const end = performance.now();
    return end - start;
 }