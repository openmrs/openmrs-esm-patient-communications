![Node.js CI](https://github.com/openmrs/openmrs-esm-patient-communications/workflows/Node.js%20CI/badge.svg)

# OpenMRS Patient Communications

[SMS module](https://github.com/johnsonandjohnson/openmrs-distro-cfl/wiki/Admin-SMS) to enable track and sending SMS to OpenMRS users.

[Messsages module](https://github.com/johnsonandjohnson/openmrs-distro-cfl/wiki/Admin-Messages) to enable configuration and sending Message services to OpenMRS users

## Running this code

```sh
yarn  # to install dependencies

yarn start --sources 'packages/esm-sms-app' / 'packages/esm-messages-app' # to run a specific application
```

## Specify to connect to the "Connect for Life" backend

for example

```sh
yarn start --sources=packages/esm-messages-app --port=5000 --backend=https://demo.jnj.connect-for-life.org
```

