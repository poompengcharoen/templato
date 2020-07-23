import chalk from "chalk";
import clear from "clear";
import figlet from "figlet";
import fs from "fs";
import inquirer from "inquirer";

const formatPath = (path: string) => path.replace(/'/g, "").trim();

const getConfig = async () => {
  const questions = [
    {
      name: "inputPath",
      type: "input",
      message: "Enter the template path:",
      default: "/path/to/input.txt",
      validate: (value: string) =>
        !value.length ? "Please provide a path to the template file." : true,
    },
    {
      name: "outputName",
      type: "input",
      message: "Enter the output file name:",
      default: "file-[TEMPLATO.index].txt",
      validate: (value: string) =>
        !value.length ? "Please provide an output file name." : true,
    },
    {
      name: "copies",
      type: "number",
      message: "How many copies?",
      default: "100",
      validate: (value: number) => value !== 0,
    },
    {
      name: "outputPath",
      type: "input",
      message: "Enter the output path:",
      default: "/path/to/output-folder",
      validate: (value: string) =>
        !value.length ? "Please provide a path to the output folder." : true,
    },
  ];

  const config = await inquirer.prompt(questions);

  return config;
};

const getTemplate = async (path: string) => {
  const template = fs.readFileSync(formatPath(path), "utf8");
  const pattern = /\[TEMPLATO.(.*?)\]/g;
  const matches = template.match(pattern);
  const tokens =
    matches
      ?.map((match) => {
        const token = match.trim().replace("[TEMPLATO.", "").replace("]", "");
        return token;
      })
      .filter((token) => token !== "index") || [];
  const questions = tokens?.map((token) => {
    return {
      name: token,
      type: "input",
      message: `What is the value of "${token}"?`,
      validate: (value: string) =>
        !value.length ? `Please provide a value for "${token}".` : true,
    };
  });
  const values = await inquirer.prompt(questions || []);
  const replacements = tokens?.map((token) => {
    return {
      find: `[TEMPLATO.${token}]`,
      value: values[token].toString(),
    };
  });

  if (!tokens.length || !replacements.length) {
    return template;
  } else {
    let newTemplate = template;
    replacements.forEach((replacement: { find: string; value: string }) => {
      newTemplate = newTemplate.replace(replacement.find, replacement.value);
    });

    return newTemplate;
  }
};

const main = async () => {
  try {
    clear();

    console.log(
      chalk.cyan(
        figlet.textSync("Templato", {
          horizontalLayout: "full",
        })
      )
    );

    console.log(chalk.yellow("A simple template to files generator."));

    const { inputPath, outputName, copies, outputPath } = await getConfig();
    const template = await getTemplate(inputPath);
    const confirmations = await inquirer.prompt([
      {
        name: "confirm",
        type: "confirm",
        message: "Confirm and start generating?",
      },
    ]);

    if (!confirmations.confirm) {
      console.log(chalk.red("Abort!"));
    } else if (copies < 1) {
      console.log(chalk.green("Done!"));
    } else {
      for (let i = 0; i <= copies - 1; i++) {
        const indexLength = i.toString().length;
        const lengthDiff = copies.toString().length - indexLength - 1;
        const newIndex = lengthDiff <= 0 ? i : "0".repeat(lengthDiff) + i;
        const newFilePath = `${formatPath(outputPath)}/${outputName.replace(
          "[TEMPLATO.index]",
          newIndex.toString()
        )}`;
        const newFileContent = template.replace(
          "[TEMPLATO.index]",
          newIndex.toString()
        );
        fs.writeFile(newFilePath, newFileContent, (error) => {
          if (error) {
            console.error(error);
          }

          if (i === copies - 1) {
            console.log(chalk.green("Done!"));
          }
        });
      }
    }
  } catch (error) {
    console.error(error);
  }
};

main();
