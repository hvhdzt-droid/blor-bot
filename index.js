const {
  Client,
  GatewayIntentBits,
  PermissionsBitField,
  SlashCommandBuilder,
  REST,
  Routes,
  EmbedBuilder
} = require("discord.js");

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// =========================
// الأوامر
// =========================

const commands = [
  new SlashCommandBuilder()
    .setName("help")
    .setDescription("عرض جميع أوامر البوت"),

  new SlashCommandBuilder()
    .setName("ping")
    .setDescription("معرفة سرعة البوت"),

  new SlashCommandBuilder()
    .setName("server")
    .setDescription("معلومات السيرفر"),

  new SlashCommandBuilder()
    .setName("avatar")
    .setDescription("عرض صورة العضو")
    .addUserOption(o =>
      o.setName("user")
        .setDescription("العضو")
        .setRequired(false)
    ),

  new SlashCommandBuilder()
    .setName("clear")
    .setDescription("حذف رسائل")
    .addIntegerOption(o =>
      o.setName("amount")
        .setDescription("عدد الرسائل")
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(100)
    ),

  new SlashCommandBuilder()
    .setName("kick")
    .setDescription("طرد عضو")
    .addUserOption(o =>
      o.setName("user")
        .setDescription("العضو")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("ban")
    .setDescription("حظر عضو")
    .addUserOption(o =>
      o.setName("user")
        .setDescription("العضو")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("say")
    .setDescription("إرسال رسالة باسم البوت")
    .addStringOption(o =>
      o.setName("message")
        .setDescription("الرسالة")
        .setRequired(true)
    )
].map(command => command.toJSON());

// =========================
// تسجيل الأوامر
// =========================

const rest = new REST({ version: "10" }).setToken(TOKEN);

(async () => {
  try {
    console.log("جاري تسجيل الأوامر...");

    await rest.put(
      Routes.applicationCommands(CLIENT_ID),
      { body: commands }
    );

    console.log("تم تسجيل الأوامر بنجاح!");
  } catch (error) {
    console.error("خطأ في تسجيل الأوامر:", error);
  }
})();

// =========================
// تشغيل البوت
// =========================

client.once("ready", () => {
  console.log(`تم تشغيل البوت: ${client.user.tag}`);

  client.user.setActivity("3KAF BOT", {
    type: 0
  });
});

// =========================
// استقبال الأوامر
// =========================

client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = interaction.commandName;

  try {
    // =========================
    // PING
    // =========================

    if (command === "ping") {
      return await interaction.reply(
        `🏓 Pong! السرعة: ${client.ws.ping}ms`
      );
    }

    // =========================
    // HELP
    // =========================

    if (command === "help") {
      const embed = new EmbedBuilder()
        .setTitle("🤖 أوامر البوت")
        .setDescription(
          "`/help` — قائمة الأوامر\n" +
          "`/ping` — سرعة البوت\n" +
          "`/server` — معلومات السيرفر\n" +
          "`/avatar` — صورة عضو\n" +
          "`/clear` — حذف رسائل\n" +
          "`/kick` — طرد عضو\n" +
          "`/ban` — حظر عضو\n" +
          "`/say` — إرسال رسالة"
        )
        .setFooter({ text: "3KAF BOT" });

      return await interaction.reply({
        embeds: [embed]
      });
    }

    // =========================
    // SERVER
    // =========================

    if (command === "server") {
      const guild = interaction.guild;

      const embed = new EmbedBuilder()
        .setTitle(`📊 ${guild.name}`)
        .addFields(
          {
            name: "👥 الأعضاء",
            value: `${guild.memberCount}`,
            inline: true
          },
          {
            name: "🆔 ID",
            value: guild.id,
            inline: true
          }
        );

      return await interaction.reply({
        embeds: [embed]
      });
    }

    // =========================
    // AVATAR
    // =========================

    if (command === "avatar") {
      const user =
        interaction.options.getUser("user") ||
        interaction.user;

      return await interaction.reply({
        content: user.displayAvatarURL({
          extension: "png",
          size: 1024
        })
      });
    }

    // =========================
    // CLEAR
    // =========================

    if (command === "clear") {
      if (
        !interaction.member.permissions.has(
          PermissionsBitField.Flags.ManageMessages
        )
      ) {
        return await interaction.reply({
          content: "❌ ما عندك صلاحية حذف الرسائل.",
          ephemeral: true
        });
      }

      const amount =
        interaction.options.getInteger("amount");

      await interaction.channel.bulkDelete(amount, true);

      return await interaction.reply({
        content: `🧹 تم حذف ${amount} رسالة.`,
        ephemeral: true
      });
    }

    // =========================
    // KICK
    // =========================

    if (command === "kick") {
      if (
        !interaction.member.permissions.has(
          PermissionsBitField.Flags.KickMembers
        )
      ) {
        return await interaction.reply({
          content: "❌ ما عندك صلاحية الطرد.",
          ephemeral: true
        });
      }

      const user =
        interaction.options.getUser("user");

      const member =
        await interaction.guild.members.fetch(user.id);

      if (!member.kickable) {
        return await interaction.reply({
          content: "❌ ما أقدر أطرد هذا العضو.",
          ephemeral: true
        });
      }

      await member.kick();

      return await interaction.reply(
        `👢 تم طرد **${user.tag}**`
      );
    }

    // =========================
    // BAN
    // =========================

    if (command === "ban") {
      if (
        !interaction.member.permissions.has(
          PermissionsBitField.Flags.BanMembers
        )
      ) {
        return await interaction.reply({
          content: "❌ ما عندك صلاحية الحظر.",
          ephemeral: true
        });
      }

      const user =
        interaction.options.getUser("user");

      const member =
        await interaction.guild.members.fetch(user.id);

      if (!member.bannable) {
        return await interaction.reply({
          content: "❌ ما أقدر أحظر هذا العضو.",
          ephemeral: true
        });
      }

      await member.ban();

      return await interaction.reply(
        `🔨 تم حظر **${user.tag}**`
      );
    }

    // =========================
    // SAY
    // =========================

    if (command === "say") {
      if (
        !interaction.member.permissions.has(
          PermissionsBitField.Flags.ManageMessages
        )
      ) {
        return await interaction.reply({
          content: "❌ ما عندك صلاحية استخدام الأمر.",
          ephemeral: true
        });
      }

      const message =
        interaction.options.getString("message");

      await interaction.reply({
        content: "✅ تم الإرسال.",
        ephemeral: true
      });

      await interaction.channel.send(message);

      return;
    }

  } catch (error) {
    console.error("حدث خطأ أثناء تنفيذ الأمر:", error);

    // إذا كان الأمر تم الرد عليه مسبقًا
    if (interaction.replied || interaction.deferred) {
      try {
        await interaction.followUp({
          content: "❌ حدث خطأ أثناء تنفيذ الأمر.",
          ephemeral: true
        });
      } catch (followUpError) {
        console.error(
          "تعذر إرسال رسالة الخطأ:",
          followUpError
        );
      }

      return;
    }

    // إذا لم يتم الرد على الأمر
    try {
      await interaction.reply({
        content: "❌ حدث خطأ أثناء تنفيذ الأمر.",
        ephemeral: true
      });
    } catch (replyError) {
      console.error(
        "تعذر الرد على الأمر:",
        replyError
      );
    }
  }
});

// =========================
// منع انهيار البوت بسبب أخطاء Client
// =========================

client.on("error", error => {
  console.error("Discord Client Error:", error);
});

client.on("warn", warning => {
  console.warn("Discord Warning:", warning);
});

// =========================
// تسجيل الدخول
// =========================

client.login(TOKEN);
