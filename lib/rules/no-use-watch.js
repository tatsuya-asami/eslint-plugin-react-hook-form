/**
 * @fileoverview Use useWatch instead of watch. This ensures the hook has subscribed to the state changes when using React Compiler.
 * @author tatsuya.asami
 */
"use strict";

const findPropertyByName = require("../utils/findPropertyByName");

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Use useWatch instead of watch. This ensures the hook has subscribed to the state changes when using React Compiler",
      category: "Possible Errors",
      url: "https://github.com/andykao1213/eslint-plugin-react-hook-form/blob/main/docs/rules/no-use-watch.md",
    },
    messages: {
      useUseWatch: "Use useWatch instead of watch.",
    },
  },

  create: function (context) {
    //----------------------------------------------------------------------
    // Helpers
    //----------------------------------------------------------------------

    function check(node) {
      if (
        node.type === "VariableDeclarator" &&
        node.init?.type === "CallExpression" &&
        (node.init?.callee.name === "useForm" ||
          node.init?.callee.name === "useFormContext")
      ) {
        if (node.id.type === "Identifier") {
          const formMethodsVar = context.getScope().set.get(node.id.name);
          formMethodsVar.references.forEach((formMethodsReference) => {
            const { parent } = formMethodsReference.identifier;

            if (
              parent.type === "MemberExpression" &&
              parent.property.type === "Identifier" &&
              parent.property.name === "watch"
            ) {
              context.report({
                node: parent.property,
                messageId: "useUseWatch",
              });
            }
          });
        } else {
          const watchProperty = findPropertyByName(node, "watch");
          // Only looking for {watch} or {watch: alias}
          if (watchProperty?.value.type !== "Identifier") return;
          return context.report({
            node: watchProperty.value,
            messageId: "useUseWatch",
          });
        }
      }
    }

    //----------------------------------------------------------------------
    // Public
    //----------------------------------------------------------------------

    return {
      VariableDeclarator: check,
    };
  },
};