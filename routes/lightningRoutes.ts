import { Request, Response } from "express";
import lightning from "../Lightning";
import db from "../Supabase";
import crypto from "crypto";
import ByteBuffer from "bytebuffer";
import sha from "js-sha256";
/**
 * POST /api/connect
 */
export const connect = async (req: Request, res: Response) => {
  const { host } = req.body;
  const { token, pubkey } = await lightning.connect(host);
  await db.addNode({ host, token, pubkey });
  res.send({ token });
};

/**
 * GET /api/info
 */
export const getInfo = async (req: Request, res: Response) => {
  const { token } = req.body;
  if (!token) throw new Error("Your node is not connected!");
  // find the node that's making the request
  const node = await db.getNodeByToken(token);
  if (!node) throw new Error("Node not found with this token");

  // get the node's pubkey and alias
  const rpc = lightning.getLnRpc();
  const { alias, identityPubkey: pubkey } = await rpc.getInfo();
  const { balance } = await rpc.channelBalance();
  res.send({ alias, balance, pubkey });
};

export const createBountyInvoice = async (req: Request, res: Response) => {
  const { amount, userId, bountyId } = req.body;
  const rpc = lightning.getLnRpc();
  const inv = await rpc.addInvoice({
    value: amount.toString(),
    memo: userId && bountyId ? JSON.stringify({ userId, bountyId }) : undefined,
  });
  res.send({
    payreq: inv.paymentRequest,
    hash: (inv.rHash as Buffer).toString("base64"),
    amount,
  });
};

export const sendKeysend = async (req: Request, res: Response) => {
  // const { pubkey } = req.body;
  const randoStr = crypto.randomBytes(32).toString("base64");
  // const preimage = Buffer.from(randostr).toString('base64')
  console.log(new Blob([randoStr]).size);
  const wosPub =
    "035e4ff418fc8b5554c5d9eea66396c227bd429a3251c8cbc711002ba215bfc226";
  const muunPub =
    "03d831eb02996b2e0eda05d01a3f17d998f620a9c842f28fa75ca028aab8d103e7";
  const rpc = lightning.getRouterRpc();
  try {
    const resoo = await rpc.sendPaymentV2({
      dest: Buffer.from(wosPub, "hex"),
      // dest: Buffer.from(muunPub, "base64"),
      amt: 100,
      allowSelfPayment: true,
      timeoutSeconds: 16,
      // destFeatures: [9],
      feeLimitSat: 20,
      paymentHash: Buffer.from(randoStr, "hex"),
    });

    console.log(resoo);

    // circular erro, just need to see the error in postman so i can compare with the error on voltage cloud
    res.send({ ok: true });
  } catch (err) {
    console.log("err", err);
    res.send({ ok: false });
  }
};

export const createInvoice = async (req: Request, res: Response) => {
  const { token, amount } = req.body;
  const rpc = lightning.getLnRpc();
  const inv = await rpc.addInvoice({ value: amount.toString() });
  res.send({
    payreq: inv.paymentRequest,
    hash: (inv.rHash as Buffer).toString("base64"),
    amount,
  });
};
