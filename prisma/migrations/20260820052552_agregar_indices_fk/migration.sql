-- CreateIndex
CREATE INDEX "detalle_venta_id_venta_idx" ON "detalle_venta"("id_venta");

-- CreateIndex
CREATE INDEX "detalle_venta_id_producto_idx" ON "detalle_venta"("id_producto");

-- CreateIndex
CREATE INDEX "producto_id_categoria_idx" ON "producto"("id_categoria");

-- CreateIndex
CREATE INDEX "venta_id_usuario_idx" ON "venta"("id_usuario");
