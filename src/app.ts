import chalk from "chalk";
import clear from "clear";
import figlet from "figlet";
import fs from "fs";
import inquirer from "inquirer";

const main = async () => {
  try {
    // Introduction
    clear();

    console.log(
      chalk.cyan(
        figlet.textSync("Templato", {
          horizontalLayout: "full",
        })
      )
    );

    console.log(chalk.yellow("A simple template to files generator."));

    // Config
    const config = await inquirer.prompt([
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
    ]);
    const { inputPath, outputName, copies, outputPath } = config;

    // Get template
    const formatPath = (path: string) => path.replace(/'/g, "").trim();
    const getTemplate = async (path: string) => {
      let template = fs.readFileSync(formatPath(path), "utf8");
      const tokens = template
        .match(/\[TEMPLATO.(.*?)\]/g)
        ?.filter((token) => token !== "[TEMPLATO.index]");
      const tokenize = (token: string) =>
        token.replace("[TEMPLATO.", "").replace("]", "");
      const values = await inquirer.prompt(
        tokens?.map((token) => {
          const index = tokenize(token);
          return {
            name: index,
            type: "input",
            message: `What is the value of "${index}"?`,
            validate: (value: string) =>
              !value.length ? `Please provide a value for "${index}".` : true,
          };
        }) || []
      );

      tokens?.forEach((token) => {
        template = template.replace(token, values[tokenize(token)]);
      });

      return template;
    };
    const template = await getTemplate(inputPath);

    // Get confirmation
    const confirmations = await inquirer.prompt([
      {
        name: "confirm",
        type: "confirm",
        message: "Confirm and start generating?",
      },
    ]);
    if (!confirmations.confirm) {
      console.log(chalk.red("Abort!"));
      return;
    }
    if (copies < 1) {
      console.log(chalk.green("Done!"));
      return;
    }

    // Generate files
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
  } catch (error) {
    console.error(error);
  }
};

main();
