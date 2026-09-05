import { parentPort, isMainThread } from "node:worker_threads";

// Procesa en segundo plano los datos consolidados de balance y responde al hilo principal
if (!isMainThread && parentPort) {
  parentPort.on("message", (datos: { ventas: number; ingresos: number; gastos: number }) => {
    const resultado = {
      ventas: datos.ventas,
      ingresos: datos.ingresos,
      gastos: datos.gastos,
      balance: datos.ingresos - datos.gastos
    };
    parentPort?.postMessage(resultado);
    parentPort?.close();
  });
}
