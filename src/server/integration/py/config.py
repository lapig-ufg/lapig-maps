#!/usr/bin/env python
"""Required credentials configuration."""

# The service account email address authorized by your Google contact.
# The process to set up a service account is described in the README.
EE_ACCOUNT = '163878256934-uorqnep89dmauei9tv8s5cmhcro4s0p9@developer.gserviceaccount.com'

# The private key associated with your service account in Privacy Enhanced
# Email format (.pem suffix).  To convert a private key from the RSA format
# (.p12 suffix) to .pem, run the openssl command like this:
# openssl pkcs12 -in downloaded-privatekey.p12 -nodes -nocerts > privatekey.pem
# You can find more detailed instructions in the README.
EE_PRIVATE_KEY_FILE = '/home/jose/Documentos/github/lapig-maps/src/server/integration/py/lapig-ee-09144f43f3b5.pem'
