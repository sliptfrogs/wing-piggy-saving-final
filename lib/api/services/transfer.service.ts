export const transferService = {
  processQR: async (token: string, qrBase64: string, amount: number, notes?: string) => {
    const response = await fetch('/api/transfer/process', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        qr_base64_data: qrBase64,
        amount,
        notes: notes || '',
      }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Transfer failed');
    return data;
  },
};
