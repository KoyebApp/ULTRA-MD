FROM docker.io/library/umd:latest
RUN git clone https://github.com/GlobalTechInfo/ULTRA-MD /root/qasim
RUN rm -rf /root/qasim/.git
WORKDIR /root/qasim
RUN npm install || yarn install
EXPOSE 5000
CMD ["npm","start" ]
