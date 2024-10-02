// Main function that converts JSON to XML
const convertJSONToXML = json => {
  const { message, transactions } = json;

  // Check for required fields in the main object
  if (!message) throw new Error("Missing 'message' object");
  if (!transactions || !Array.isArray(transactions))
    throw new Error("Missing or invalid 'transactions' array");

  let xml = `<?xml version="1.0" encoding="UTF-8" ?>\n`;
  xml += `<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pain.001.001.12">\n`;
  xml += `  <CstmrCdtTrfInitn>\n`;

  // Call helper functions to build XML parts
  xml += buildGrpHdr(message);
  xml += buildPmtInf(message, transactions);

  xml += `  </CstmrCdtTrfInitn>\n`;
  xml += `</Document>\n`;

  return xml;
};

// Helper function to build GrpHdr
const buildGrpHdr = message => {
  validateField(message.msg_id, "msg_id");
  validateField(message.cre_dt_tm, "cre_dt_tm");
  validateField(message.nb_of_txs, "nb_of_txs");
  validateField(message.ctrl_sum, "ctrl_sum");

  return (
    `    <GrpHdr>\n` +
    `      <MsgId>${message.msg_id}</MsgId>\n` +
    `      <CreDtTm>${message.cre_dt_tm}</CreDtTm>\n` +
    `      <NbOfTxs>${message.nb_of_txs}</NbOfTxs>\n` +
    `      <CtrlSum>${message.ctrl_sum}</CtrlSum>\n` +
    buildInitgPty(message) +
    `    </GrpHdr>\n`
  );
};

// Helper function to build InitgPty (part of GrpHdr)
const buildInitgPty = message => {
  validateField(message.initg_pty_name, "initg_pty_name");
  validateField(message.initg_pty_org_id, "initg_pty_org_id");

  return (
    `      <InitgPty>\n` +
    `        <Nm>${message.initg_pty_name}</Nm>\n` +
    `        <Id>\n` +
    `          <OrgId>\n` +
    `            <Othr>\n` +
    `              <Id>${message.initg_pty_org_id}</Id>\n` +
    `            </Othr>\n` +
    `          </OrgId>\n` +
    `        </Id>\n` +
    `      </InitgPty>\n`
  );
};

// Helper function to build PmtInf
const buildPmtInf = (message, transactions) => {
  validateField(message.pmt_inf_id, "pmt_inf_id");
  validateField(message.pmt_mtd, "pmt_mtd");
  validateField(message.nb_of_txs, "nb_of_txs");
  validateField(message.ctrl_sum, "ctrl_sum");
  validateField(message.svc_lvl, "svc_lvl");
  validateField(message.reqd_exctn_dt, "reqd_exctn_dt");

  let pmtInf = `    <PmtInf>\n`;
  pmtInf += `      <PmtInfId>${message.pmt_inf_id}</PmtInfId>\n`;
  pmtInf += `      <PmtMtd>${message.pmt_mtd}</PmtMtd>\n`;
  pmtInf += `      <NbOfTxs>${message.nb_of_txs}</NbOfTxs>\n`;
  pmtInf += `      <CtrlSum>${message.ctrl_sum}</CtrlSum>\n`;
  pmtInf += buildPmtTpInf(message);
  pmtInf += `      <ReqdExctnDt>\n`;
  pmtInf += `        <DtTm>${message.reqd_exctn_dt}T14:00:00</DtTm>\n`;
  pmtInf += `      </ReqdExctnDt>\n`;
  pmtInf += buildDbtr(message);

  // Loop through transactions and build each CdtTrfTxInf
  transactions.forEach(transaction => {
    pmtInf += buildCdtTrfTxInf(transaction);
  });

  pmtInf += `    </PmtInf>\n`;

  return pmtInf;
};

// Helper function to build PmtTpInf (part of PmtInf)
const buildPmtTpInf = message => {
  validateField(message.svc_lvl, "svc_lvl");

  return (
    `      <PmtTpInf>\n` +
    `        <SvcLvl>\n` +
    `          <Cd>${message.svc_lvl}</Cd>\n` +
    `        </SvcLvl>\n` +
    `      </PmtTpInf>\n`
  );
};

// Helper function to build Debtor (Dbtr) info (part of PmtInf)
const buildDbtr = message => {
  validateField(message.dbtr_name, "dbtr_name");
  validateField(message.dbtr_acct_iban, "dbtr_acct_iban");
  validateField(message.dbtr_acct_currency, "dbtr_acct_currency");
  validateField(message.dbtr_agt_bicfi, "dbtr_agt_bicfi");

  return (
    `      <Dbtr>\n` +
    `        <Nm>${message.dbtr_name}</Nm>\n` +
    `      </Dbtr>\n` +
    `      <DbtrAcct>\n` +
    `        <Id>\n` +
    `          <IBAN>${message.dbtr_acct_iban}</IBAN>\n` +
    `        </Id>\n` +
    `        <Ccy>${message.dbtr_acct_currency}</Ccy>\n` +
    `      </DbtrAcct>\n` +
    `      <DbtrAgt>\n` +
    `        <FinInstnId>\n` +
    `          <BICFI>${message.dbtr_agt_bicfi}</BICFI>\n` +
    `        </FinInstnId>\n` +
    `      </DbtrAgt>\n`
  );
};

// Helper function to build CdtTrfTxInf (each transaction)
const buildCdtTrfTxInf = transaction => {
  validateField(transaction.end_to_end_id, "end_to_end_id");
  validateField(transaction.instd_amt, "instd_amt");
  validateField(transaction.instd_amt_currency, "instd_amt_currency");
  validateField(transaction.xchg_rate_inf_unit_ccy, "xchg_rate_inf_unit_ccy");
  validateField(transaction.xchg_rate_inf_xchg_rate, "xchg_rate_inf_xchg_rate");
  validateField(transaction.cdtr_agt_bicfi, "cdtr_agt_bicfi");
  validateField(transaction.cdtr_acct_iban, "cdtr_acct_iban");

  return (
    `      <CdtTrfTxInf>\n` +
    `        <PmtId>\n` +
    `          <EndToEndId>${transaction.end_to_end_id}</EndToEndId>\n` +
    `        </PmtId>\n` +
    `        <Amt>\n` +
    `          <InstdAmt Ccy="${transaction.instd_amt_currency}">${transaction.instd_amt}</InstdAmt>\n` +
    `        </Amt>\n` +
    buildXchgRateInf(transaction) +
    buildCdtrAgt(transaction) +
    buildCdtrAcct(transaction) +
    `      </CdtTrfTxInf>\n`
  );
};

// Helper function to build XchgRateInf (part of each transaction)
const buildXchgRateInf = transaction => {
  validateField(transaction.xchg_rate_inf_unit_ccy, "xchg_rate_inf_unit_ccy");
  validateField(transaction.xchg_rate_inf_xchg_rate, "xchg_rate_inf_xchg_rate");

  return (
    `        <XchgRateInf>\n` +
    `          <UnitCcy>${transaction.xchg_rate_inf_unit_ccy}</UnitCcy>\n` +
    `          <XchgRate>${transaction.xchg_rate_inf_xchg_rate}</XchgRate>\n` +
    `        </XchgRateInf>\n`
  );
};

// Helper function to build CdtrAgt (part of each transaction)
const buildCdtrAgt = transaction => {
  validateField(transaction.cdtr_agt_bicfi, "cdtr_agt_bicfi");

  return (
    `        <CdtrAgt>\n` +
    `          <FinInstnId>\n` +
    `            <BICFI>${transaction.cdtr_agt_bicfi}</BICFI>\n` +
    `          </FinInstnId>\n` +
    `        </CdtrAgt>\n`
  );
};

// Helper function to build CdtrAcct (part of each transaction)
const buildCdtrAcct = transaction => {
  validateField(transaction.cdtr_acct_iban, "cdtr_acct_iban");

  return (
    `        <CdtrAcct>\n` +
    `          <Id>\n` +
    `            <IBAN>${transaction.cdtr_acct_iban}</IBAN>\n` +
    `          </Id>\n` +
    `        </CdtrAcct>\n`
  );
};

const validateField = (field, fieldName) => {
  if (!field) {
    throw new Error(`Missing or invalid '${fieldName}'`);
  }
};

module.exports = {
  convertJSONToXML,
};
