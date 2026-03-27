/**
 * Danh sách ngân hàng Việt Nam với mã BIN cho VietQR
 */
export const VIETNAM_BANKS = [
    { name: 'Vietcombank', bin: '970436', shortName: 'VCB' },
    { name: 'VietinBank', bin: '970415', shortName: 'CTG' },
    { name: 'BIDV', bin: '970418', shortName: 'BIDV' },
    { name: 'Agribank', bin: '970405', shortName: 'AGR' },
    { name: 'Techcombank', bin: '970407', shortName: 'TCB' },
    { name: 'MB Bank', bin: '970422', shortName: 'MB' },
    { name: 'ACB', bin: '970416', shortName: 'ACB' },
    { name: 'VPBank', bin: '970432', shortName: 'VPB' },
    { name: 'TPBank', bin: '970423', shortName: 'TPB' },
    { name: 'Sacombank', bin: '970403', shortName: 'STB' },
    { name: 'HDBank', bin: '970437', shortName: 'HDB' },
    { name: 'VIB', bin: '970441', shortName: 'VIB' },
    { name: 'SHB', bin: '970443', shortName: 'SHB' },
    { name: 'Eximbank', bin: '970431', shortName: 'EIB' },
    { name: 'MSB', bin: '970426', shortName: 'MSB' },
    { name: 'SeABank', bin: '970440', shortName: 'SEAB' },
    { name: 'OCB', bin: '970448', shortName: 'OCB' },
    { name: 'LienVietPostBank', bin: '970449', shortName: 'LPB' },
    { name: 'Nam A Bank', bin: '970428', shortName: 'NAB' },
    { name: 'Bac A Bank', bin: '970409', shortName: 'BAB' },
    { name: 'PVcomBank', bin: '970412', shortName: 'PVCB' },
    { name: 'Kienlongbank', bin: '970452', shortName: 'KLB' },
    { name: 'ABBank', bin: '970425', shortName: 'ABB' },
    { name: 'NCB', bin: '970419', shortName: 'NCB' },
    { name: 'OceanBank', bin: '970414', shortName: 'OJB' },
    { name: 'GPBank', bin: '970408', shortName: 'GPB' },
    { name: 'CBBank', bin: '970444', shortName: 'CBB' },
    { name: 'Saigonbank', bin: '970400', shortName: 'SGBL' },
    { name: 'VietBank', bin: '970433', shortName: 'VBB' },
    { name: 'CAKE', bin: '546034', shortName: 'CAKE' },
    { name: 'Timo', bin: '963388', shortName: 'Timo' },
    { name: 'MoMo', bin: '970539', shortName: 'MOMO' },
    { name: 'ZaloPay', bin: '970540', shortName: 'ZLP' },
];

/**
 * Tạo URL QR VietQR cho admin
 * @param {string} bankBin - Mã BIN ngân hàng
 * @param {string} accountNo - Số tài khoản
 * @param {number} amount - Số tiền hoàn (0 nếu không định sẵn)
 * @param {string} description - Nội dung chuyển khoản
 */
export const getVietQrUrl = (bankBin, accountNo, amount = 0, description = '') => {
    const encodedDesc = encodeURIComponent(description);
    return `https://img.vietqr.io/image/${bankBin}-${accountNo}-compact2.png?amount=${amount}&addInfo=${encodedDesc}&accountName=`;
};

/**
 * Tìm bank object theo tên
 */
export const findBankByName = (name) => {
    if (!name) return null;
    return VIETNAM_BANKS.find(b =>
        b.name.toLowerCase() === name.toLowerCase() ||
        b.shortName.toLowerCase() === name.toLowerCase()
    ) || null;
};
