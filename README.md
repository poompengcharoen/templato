# Templato

A simple template to files generator.

## Documentation

### Installation

Install Node.js dependencies.

```shell
npm install
```

#### Build application

Build the application from TypeScript.

```shell
npm run build
```

### Usage

#### Start application

Run the application and follow its instruction.

```shell
npm start
```

#### Template Syntax

You can get the file index number in the template input file like this.

```txt
[TEMPLATO.index]
```

You can get the variables in the template input file like this. Templato will ask you the values of the variables.

```txt
[TEMPLATO.foo]
[TEMPLATO.bar]
[TEMPLATO.axy]
[TEMPLATO.etc]
```

#### Template Sample

Input:

```txt
This file number is [TEMPLATO.index].

Hello my name is [TEMPLATO.name]. I am a [TEMPLATO.career].
```

Output:

```txt
This file number is 003.

Hello my name is John Doe. I am a programmer.
```
