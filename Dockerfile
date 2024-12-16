
FROM quay.io/globaltechinfo/umd:latest

RUN git clone https://github.com/GlobalTechInfo/ULTRA-MD /root/ULTRA-MD
RUN rm -rf /root/ULTRA-MD/.git

WORKDIR /root/ULTRA-MD

RUN npm install && npm install qrcode-terminal

EXPOSE 8000

CMD ["npm", "start"]
