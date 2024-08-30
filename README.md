# StellarPay - An ISO20022 Compliant Micro Payment Processor of the Stellar Network

## Table of Contents
- [Introduction](#introduction)
- [Architecture](#architecture)



## Introduction

StellarPay is a cutting-edge micropayment processor built on the Stellar network, designed to efficiently handle large volumes of small transactions. 
As traditional payment systems struggle with the high costs and inefficiencies of processing micropayments, StellarPay offers a scalable solution that converts ISO20022 messages into Stellar's SEP-31 format, enabling seamless asset swaps and cost-effective disbursements. 
This platform leverages Stellar's decentralized exchange (SDEX) and disbursement capabilities to provide a robust and compliant solution for businesses navigating the digital economy.

In this document, you'll find everything needed to get started with StellarPay. 
It covers the system's architecture, setup instructions, and API details. 
You’ll also find testing procedures (TBD) and benchmarking metrics (TBD) to help you optimize performance. 


## Architecture

![System Level Diagram](./resources/img/system_level_diagram.png)

StellarPay is designed to facilitate efficient micropayments by leveraging the Stellar network's decentralized infrastructure. 
The system architecture is divided into several key components that work together to process, convert, and disburse micropayments in a secure and scalable manner. 

Below is a step-by-step breakdown of the system's architecture based on the provided diagram and step guide:


### 1. ISO20022 Message Gateway (IMG)
The ISO20022 Message Gateway is the entry point for external financial institutions. 
It handles the processing of ISO20022 messages, a standardized messaging format used for financial transactions. 

The gateway performs several critical functions:

- **ISO-Message Validation**: Ensure the incoming ISO20022 message adheres to the required standards.
- **Message Parsing**: Extracts necessary data from the ISO20022 message.
- **Message Forwarding**: Forwards the converted SEP-31 message to the appropriate endpoint withing the StellarPay system.

### 2. Sender System (Part of the PoC)
The Sender System is a system set up to showcase StellarPays capabilities as part of a PoC.

It includes:
- **(Adjusted) SEP-31 Endpoint**: SEP-31 is Stellars X-Border transaction standard. We will make use of a slightly adjusted SEP-31 standard to fit the needs of micro paymant processing.
- **Funding Wallet**: The Senders wallet containing the necessary funding in Stellar native assets.
- **Payment Information**: 

### 3. Path Payment (SDEX)
Stellar's own Path Payment system is used to convert th asset from the Sender's currecny to the Receiver's desired currency.

It provides:

- **Conversion Rate Estimate**: Providing an estimate of the conversion rate based on current market conditions.
- **Asset Conversion**: Executing the conversion of the asset at the estimated rate.

### 4. Stellar Disbursement Platform (SDP)
Once the asset conversion is completed, the Sender interacts with the Stellar Disbursement Platform to finalize the disbursement of funds:

- **Disbursement Wallet**: The wallet the Sender funds with their **Funding Wallet** in order to make the batch transaction.
- **Disbursement Request**: The Sender initiates the disbursement by sending a disbursement request to the SDP.
- **Execute Disbursement**: The sender provides the information of the Receivers, triggering the beginning of the disbursement.

### 5. Receiver System (Part of the PoC)
The Receiver System is another system set up to showcase StellarPays capabilities as part of a PoC.

It includes:

- **(Adjusted) SEP-31 Endpoint**: Similar to the Sender System.
- **Receiver Wallet(s)**: Wallets to receive the funds disbursed by SDP.

