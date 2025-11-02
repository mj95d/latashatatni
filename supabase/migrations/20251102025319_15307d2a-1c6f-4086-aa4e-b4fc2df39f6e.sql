-- السماح للمستخدمين المسجلين برفع ملفات إثبات الدفع
CREATE POLICY "Users can upload payment proofs"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'store-documents' 
  AND (storage.foldername(name))[1] = 'payment-proofs'
);

-- السماح للمستخدمين بقراءة ملفات إثبات الدفع الخاصة بهم
CREATE POLICY "Users can read their payment proofs"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'store-documents' 
  AND (storage.foldername(name))[1] = 'payment-proofs'
);

-- السماح للإداريين بقراءة جميع ملفات إثبات الدفع
CREATE POLICY "Admins can read all payment proofs"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'store-documents' 
  AND (storage.foldername(name))[1] = 'payment-proofs'
  AND has_role(auth.uid(), 'admin'::app_role)
);