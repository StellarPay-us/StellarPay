# StellarPay - An ISO20022 Compliant Micro Payment Processor of the Stellar Network

## Introduction

StellarPay is a cutting-edge micropayment processor built on the Stellar network, designed to efficiently handle large volumes of small transactions. 
As traditional payment systems struggle with the high costs and inefficiencies of processing micropayments, StellarPay offers a scalable solution that converts ISO20022 messages into Stellar's SEP-31 format, enabling seamless asset swaps and cost-effective disbursements. 
This platform leverages Stellar's decentralized exchange (SDEX) and disbursement capabilities to provide a robust and compliant solution for businesses navigating the digital economy.

In this document, you'll find everything needed to get started with StellarPay. 
It covers the system's architecture, setup instructions, and API details. 
You’ll also find testing procedures (TBD) and benchmarking metrics (TBD) to help you optimize performance. 

## Setup
To set up the StellarPay Proof of Concept (PoC), there are several distinct components that need to be operational.

### Stellar Disbursement Platform
The [Stellar Disbursement Platform (SDP)](https://github.com/stellar/stellar-disbursement-platform-backend/blob/develop/README.md) enables organizations to disburse bulk payments to recipients using Stellar.

StellarPay integrates these powerful features to facilitate a seamless experience.

#### Licensing Information
The Stellar Disbursement Platform (SDP), is licensed under the Apache License 2.0. A copy of the license can be found in the [License_SDP](./LICENSE_SDP) file included in this repository.


#### Prerequisits

##### Docker
You need to have [Docker](https://www.docker.com/products/docker-desktop/) installed on your system.

##### Golang
Ensure that Golang is installed on your system. The Go environment must be properly set up, with `$GOPATH/bin` included in your system's `$PATH`.

#### Quickinstall
```sh
chmod +x ./setup-sdp.sh
./setup-sdp.sh
```

#### Start SDP independently
```sh
./stellar-disbursement-platform-backend/dev/main.sh
```
