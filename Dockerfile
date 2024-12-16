
FROM quay.io/globaltechinfo/umd:latest

RUN git clone https://github.com/GlobalTechInfo/ULTRA-MD /root/qasi
RUN rm -rf /root/qasim/.git

WORKDIR /root/qasim

RUN npm install && npm install qrcode-terminal

EXPOSE 8000

CMD ["npm", "start"]
