const {
  Client,
  GatewayIntentBits,
  PermissionsBitField,
  SlashCommandBuilder,
  REST,
  Routes,
  EmbedBuilder,
  ChannelType
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
// التحذيرات
// =========================
const warnings = new Map();

// =========================
// الأوامر
// =========================
const commands = [

  // HELP
  new SlashCommandBuilder()
    .setName("help")
    .setDescription("عرض جميع أوامر البوت"),

  // PING
  new SlashCommandBuilder()
    .setName("ping")
    .setDescription("معرفة سرعة البوت"),

  // SERVER
  new SlashCommandBuilder()
    .setName("server")
    .setDescription("معلومات السيرفر"),

  // AVATAR
  new SlashCommandBuilder()
    .setName("avatar")
    .setDescription("عرض صورة العضو")
    .addUserOption(o =>
      o.setName("user")
        .setDescription("العضو")
        .setRequired(false)
    ),

  // USERINFO
  new SlashCommandBuilder()
    .setName("userinfo")
    .setDescription("معلومات عن عضو")
    .addUserOption(o =>
      o.setName("user")
        .setDescription("العضو")
        .setRequired(false)
    ),

  // CLEAR
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

  // KICK
  new SlashCommandBuilder()
    .setName("kick")
    .setDescription("طرد عضو")
    .addUserOption(o =>
      o.setName("user")
        .setDescription("العضو")
        .setRequired(true)
    ),

  // BAN
  new SlashCommandBuilder()
    .setName("ban")
    .setDescription("حظر عضو")
    .addUserOption(o =>
      o.setName("user")
        .setDescription("العضو")
        .setRequired(true)
    ),

  // UNBAN
  new SlashCommandBuilder()
    .setName("unban")
    .setDescription("فك حظر عضو")
    .addStringOption(o =>
      o.setName("userid")
        .setDescription("ID العضو")
        .setRequired(true)
    ),

  // TIMEOUT
  new SlashCommandBuilder()
    .setName("timeout")
    .setDescription("إعطاء عضو تايم أوت")
    .addUserOption(o =>
      o.setName("user")
        .setDescription("العضو")
        .setRequired(true)
    )
    .addIntegerOption(o =>
      o.setName("minutes")
        .setDescription("المدة بالدقائق")
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(40320)
    ),

  // UNTIMEOUT
  new SlashCommandBuilder()
    .setName("untimeout")
    .setDescription("إزالة التايم أوت")
    .addUserOption(o =>
      o.setName("user")
        .setDescription("العضو")
        .setRequired(true)
    ),

  // WARN
  new SlashCommandBuilder()
    .setName("warn")
    .setDescription("تحذير عضو")
    .addUserOption(o =>
      o.setName("user")
        .setDescription("العضو")
        .setRequired(true)
    )
    .addStringOption(o =>
      o.setName("reason")
        .setDescription("سبب التحذير")
        .setRequired(false)
    ),

  // WARNINGS
  new SlashCommandBuilder()
    .setName("warnings")
    .setDescription("عرض تحذيرات عضو")
    .addUserOption(o =>
      o.setName("user")
        .setDescription("العضو")
        .setRequired(true)
    ),

  // LOCK
  new SlashCommandBuilder()
    .setName("lock")
    .setDescription("قفل الروم"),

  // UNLOCK
  new SlashCommandBuilder()
    .setName("unlock")
    .setDescription("فتح الروم"),

  // SLOWMODE
  new SlashCommandBuilder()
    .setName("slowmode")
    .setDescription("تفعيل Slowmode")
    .addIntegerOption(o =>
      o.setName("seconds")
        .setDescription("عدد الثواني")
        .setRequired(true)
        .setMinValue(0)
        .setMaxValue(21600)
    ),

  // SAY
  new SlashCommandBuilder()
    .setName("say")
    .setDescription("إرسال رسالة باسم البوت")
    .addStringOption(o =>
      o.setName("message")
        .setDescription("الرسالة")
        .setRequired(true)
    ),

  // ANNOUNCE
  new SlashCommandBuilder()
    .setName("announce")
    .setDescription("إرسال إعلان")
    .addStringOption(o =>
      o.setName("message")
        .setDescription("نص الإعلان")
        .setRequired(true)
    ),

  // POLL
  new SlashCommandBuilder()
    .setName("poll")
    .setDescription("إنشاء تصويت")
    .addStringOption(o =>
      o.setName("question")
        .setDescription("السؤال")
        .setRequired(true)
    ),

  // ROLE
  new SlashCommandBuilder()
    .setName("role")
    .setDescription("إعطاء رتبة لعضو")
    .addUserOption(o =>
      o.setName("user")
        .setDescription("العضو")
        .setRequired(true)
    )
    .addRoleOption(o =>
      o.setName("role")
        .setDescription("الرتبة")
        .setRequired(true)
    ),

  // REMOVE ROLE
  new SlashCommandBuilder()
    .setName("removerole")
    .setDescription("إزالة رتبة من عضو")
    .addUserOption(o =>
      o.setName("user")
        .setDescription("العضو")
        .setRequired(true)
    )
    .addRoleOption(o =>
      o.setName("role")
        .setDescription("الرتبة")
        .setRequired(true)
    ),

  // NICK
  new SlashCommandBuilder()
    .setName("nick")
    .setDescription("تغيير لقب عضو")
    .addUserOption(o =>
      o.setName("user")
        .setDescription("العضو")
        .setRequired(true)
    )
    .addStringOption(o =>
      o.setName("nickname")
        .setDescription("اللقب الجديد")
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
    console.error(error);
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
// الأوامر
// =========================

client.on("interactionCreate", async interaction => {

  if (!interaction.isChatInputCommand()) return;

  const command = interaction.commandName;

  try {

    // =========================
    // PING
    // =========================

    if (command === "ping") {
      return interaction.reply(
        `🏓 Pong! السرعة: ${client.ws.ping}ms`
      );
    }

    // =========================
    // HELP
    // =========================

    if (command === "help") {

      const embed = new EmbedBuilder()
        .setTitle("🤖 أوامر 3KAF BOT")
        .setDescription(
          "**🛠️ أوامر عامة**\n" +
          "`/help` — قائمة الأوامر\n" +
          "`/ping` — سرعة البوت\n" +
          "`/server` — معلومات السيرفر\n" +
          "`/userinfo` — معلومات عضو\n" +
          "`/avatar` — صورة عضو\n\n" +

          "**🛡️ أوامر الإدارة**\n" +
          "`/clear` — حذف رسائل\n" +
          "`/kick` — طرد عضو\n" +
          "`/ban` — حظر عضو\n" +
          "`/unban` — فك الحظر\n" +
          "`/timeout` — تايم أوت\n" +
          "`/untimeout` — إزالة التايم أوت\n" +
          "`/warn` — تحذير عضو\n" +
          "`/warnings` — تحذيرات العضو\n\n" +

          "**🔒 أوامر الرومات**\n" +
          "`/lock` — قفل الروم\n" +
          "`/unlock` — فتح الروم\n" +
          "`/slowmode` — Slowmode\n\n" +

          "**🎭 أوامر الرتب**\n" +
          "`/role` — إعطاء رتبة\n" +
          "`/removerole` — إزالة رتبة\n" +
          "`/nick` — تغيير اللقب\n\n" +

          "**📢 أوامر الرسائل**\n" +
          "`/say` — إرسال رسالة\n" +
          "`/announce` — إعلان\n" +
          "`/poll` — تصويت"
        )
        .setFooter({ text: "3KAF BOT" });

      return interaction.reply({
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
          },
          {
            name: "👑 المالك",
            value: `<@${guild.ownerId}>`,
            inline: true
          }
        );

      return interaction.reply({
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

      return interaction.reply({
        content: user.displayAvatarURL({
          extension: "png",
          size: 1024
        })
      });
    }

    // =========================
    // USERINFO
    // =========================

    if (command === "userinfo") {

      const user =
        interaction.options.getUser("user") ||
        interaction.user;

      const member =
        await interaction.guild.members.fetch(user.id);

      const embed = new EmbedBuilder()
        .setTitle(`👤 معلومات ${user.username}`)
        .setThumbnail(
          user.displayAvatarURL({
            extension: "png",
            size: 512
          })
        )
        .addFields(
          {
            name: "🆔 ID",
            value: user.id
          },
          {
            name: "📅 تاريخ إنشاء الحساب",
            value: `<t:${Math.floor(user.createdTimestamp / 1000)}:D>`
          },
          {
            name: "📥 دخول السيرفر",
            value: member.joinedTimestamp
              ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:D>`
              : "غير معروف"
          }
        );

      return interaction.reply({
        embeds: [embed]
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
        return interaction.reply({
          content: "❌ ما عندك صلاحية حذف الرسائل.",
          ephemeral: true
        });
      }

      const amount =
        interaction.options.getInteger("amount");

      await interaction.channel.bulkDelete(amount, true);

      return interaction.reply({
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
        return interaction.reply({
          content: "❌ ما عندك صلاحية الطرد.",
          ephemeral: true
        });
      }

      const user =
        interaction.options.getUser("user");

      const member =
        await interaction.guild.members.fetch(user.id);

      if (!member.kickable) {
        return interaction.reply({
          content: "❌ ما أقدر أطرد هذا العضو.",
          ephemeral: true
        });
      }

      await member.kick();

      return interaction.reply(
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
        return interaction.reply({
          content: "❌ ما عندك صلاحية الحظر.",
          ephemeral: true
        });
      }

      const user =
        interaction.options.getUser("user");

      const member =
        await interaction.guild.members.fetch(user.id);

      if (!member.bannable) {
        return interaction.reply({
          content: "❌ ما أقدر أحظر هذا العضو.",
          ephemeral: true
        });
      }

      await member.ban();

      return interaction.reply(
        `🔨 تم حظر **${user.tag}**`
      );
    }

    // =========================
    // UNBAN
    // =========================

    if (command === "unban") {

      if (
        !interaction.member.permissions.has(
          PermissionsBitField.Flags.BanMembers
        )
      ) {
        return interaction.reply({
          content: "❌ ما عندك صلاحية فك الحظر.",
          ephemeral: true
        });
      }

      const userId =
        interaction.options.getString("userid");

      try {

        await interaction.guild.members.unban(userId);

        return interaction.reply(
          `✅ تم فك الحظر عن العضو صاحب ID: **${userId}**`
        );

      } catch {
        return interaction.reply({
          content: "❌ لم أجد عضوًا محظورًا بهذا الـ ID.",
          ephemeral: true
        });
      }
    }

    // =========================
    // TIMEOUT
    // =========================

    if (command === "timeout") {

      if (
        !interaction.member.permissions.has(
          PermissionsBitField.Flags.ModerateMembers
        )
      ) {
        return interaction.reply({
          content: "❌ ما عندك صلاحية التايم أوت.",
          ephemeral: true
        });
      }

      const user =
        interaction.options.getUser("user");

      const minutes =
        interaction.options.getInteger("minutes");

      const member =
        await interaction.guild.members.fetch(user.id);

      if (!member.moderatable) {
        return interaction.reply({
          content: "❌ ما أقدر أعطي هذا العضو تايم أوت.",
          ephemeral: true
        });
      }

      await member.timeout(
        minutes * 60 * 1000
      );

      return interaction.reply(
        `⏳ تم إعطاء **${user.tag}** تايم أوت لمدة **${minutes} دقيقة**.`
      );
    }

    // =========================
    // UNTIMEOUT
    // =========================

    if (command === "untimeout") {

      if (
        !interaction.member.permissions.has(
          PermissionsBitField.Flags.ModerateMembers
        )
      ) {
        return interaction.reply({
          content: "❌ ما عندك صلاحية إزالة التايم أوت.",
          ephemeral: true
        });
      }

      const user =
        interaction.options.getUser("user");

      const member =
        await interaction.guild.members.fetch(user.id);

      if (!member.moderatable) {
        return interaction.reply({
          content: "❌ ما أقدر أعدل على هذا العضو.",
          ephemeral: true
        });
      }

      await member.timeout(null);

      return interaction.reply(
        `✅ تم إزالة التايم أوت عن **${user.tag}**`
      );
    }

    // =========================
    // WARN
    // =========================

    if (command === "warn") {

      if (
        !interaction.member.permissions.has(
          PermissionsBitField.Flags.ModerateMembers
        )
      ) {
        return interaction.reply({
          content: "❌ ما عندك صلاحية التحذير.",
          ephemeral: true
        });
      }

      const user =
        interaction.options.getUser("user");

      const reason =
        interaction.options.getString("reason") ||
        "بدون سبب";

      const key =
        `${interaction.guild.id}-${user.id}`;

      if (!warnings.has(key)) {
        warnings.set(key, []);
      }

      warnings.get(key).push({
        reason: reason,
        moderator: interaction.user.tag,
        date: new Date()
      });

      const count =
        warnings.get(key).length;

      return interaction.reply(
        `⚠️ تم تحذير **${user.tag}**\nالسبب: **${reason}**\nعدد التحذيرات: **${count}**`
      );
    }

    // =========================
    // WARNINGS
    // =========================

    if (command === "warnings") {

      const user =
        interaction.options.getUser("user");

      const key =
        `${interaction.guild.id}-${user.id}`;

      const userWarnings =
        warnings.get(key) || [];

      if (userWarnings.length === 0) {
        return interaction.reply(
          `✅ **${user.tag}** ليس لديه تحذيرات.`
        );
      }

      const text =
        userWarnings
          .map(
            (w, i) =>
              `**${i + 1}.** ${w.reason} — بواسطة ${w.moderator}`
          )
          .join("\n");

      const embed = new EmbedBuilder()
        .setTitle(`⚠️ تحذيرات ${user.tag}`)
        .setDescription(text);

      return interaction.reply({
        embeds: [embed]
      });
    }

    // =========================
    // LOCK
    // =========================

    if (command === "lock") {

      if (
        !interaction.member.permissions.has(
          PermissionsBitField.Flags.ManageChannels
        )
      ) {
        return interaction.reply({
          content: "❌ ما عندك صلاحية قفل الروم.",
          ephemeral: true
        });
      }

      await interaction.channel.permissionOverwrites.edit(
        interaction.guild.roles.everyone,
        {
          SendMessages: false
        }
      );

      return interaction.reply(
        "🔒 تم قفل الروم."
      );
    }

    // =========================
    // UNLOCK
    // =========================

    if (command === "unlock") {

      if (
        !interaction.member.permissions.has(
          PermissionsBitField.Flags.ManageChannels
        )
      ) {
        return interaction.reply({
          content: "❌ ما عندك صلاحية فتح الروم.",
          ephemeral: true
        });
      }

      await interaction.channel.permissionOverwrites.edit(
        interaction.guild.roles.everyone,
        {
          SendMessages: null
        }
      );

      return interaction.reply(
        "🔓 تم فتح الروم."
      );
    }

    // =========================
    // SLOWMODE
    // =========================

    if (command === "slowmode") {

      if (
        !interaction.member.permissions.has(
          PermissionsBitField.Flags.ManageChannels
        )
      ) {
        return interaction.reply({
          content: "❌ ما عندك صلاحية استخدام Slowmode.",
          ephemeral: true
        });
      }

      const seconds =
        interaction.options.getInteger("seconds");

      await interaction.channel.setRateLimitPerUser(
        seconds
      );

      if (seconds === 0) {
        return interaction.reply(
          "✅ تم إيقاف الـ Slowmode."
        );
      }

      return interaction.reply(
        `🐌 تم تفعيل Slowmode لمدة **${seconds} ثانية**.`
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
        return interaction.reply({
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
    }

    // =========================
    // ANNOUNCE
    // =========================

    if (command === "announce") {

      if (
        !interaction.member.permissions.has(
          PermissionsBitField.Flags.ManageMessages
        )
      ) {
        return interaction.reply({
          content: "❌ ما عندك صلاحية الإعلانات.",
          ephemeral: true
        });
      }

      const message =
        interaction.options.getString("message");

      const embed = new EmbedBuilder()
        .setTitle("📢 إعلان")
        .setDescription(message)
        .setFooter({
          text: `بواسطة ${interaction.user.tag}`
        })
        .setTimestamp();

      await interaction.reply({
        content: "✅ تم إرسال الإعلان.",
        ephemeral: true
      });

      await interaction.channel.send({
        embeds: [embed]
      });
    }

    // =========================
    // POLL
    // =========================

    if (command === "poll") {

      if (
        !interaction.member.permissions.has(
          PermissionsBitField.Flags.ManageMessages
        )
      ) {
        return interaction.reply({
          content: "❌ ما عندك صلاحية إنشاء تصويت.",
          ephemeral: true
        });
      }

      const question =
        interaction.options.getString("question");

      const message =
        await interaction.channel.send(
          `📊 **تصويت**\n\n${question}\n\n👍 = نعم\n👎 = لا`
        );

      await message.react("👍");
      await message.react("👎");

      return interaction.reply({
        content: "✅ تم إنشاء التصويت.",
        ephemeral: true
      });
    }

    // =========================
    // ROLE
    // =========================

    if (command === "role") {

      if (
        !interaction.member.permissions.has(
          PermissionsBitField.Flags.ManageRoles
        )
      ) {
        return interaction.reply({
          content: "❌ ما عندك صلاحية إدارة الرتب.",
          ephemeral: true
        });
      }

      const user =
        interaction.options.getUser("user");

      const role =
        interaction.options.getRole("role");

      const member =
        await interaction.guild.members.fetch(user.id);

      if (role.position >= interaction.member.roles.highest.position) {
        return interaction.reply({
          content: "❌ ما تقدر تعطي رتبة أعلى من رتبتك.",
          ephemeral: true
        });
      }

      if (role.position >= interaction.guild.members.me.roles.highest.position) {
        return interaction.reply({
          content: "❌ رتبة البوت أقل من هذه الرتبة.",
          ephemeral: true
        });
      }

      await member.roles.add(role);

      return interaction.reply(
        `✅ تم إعطاء ${role} إلى **${user.tag}**`
      );
    }

    // =========================
    // REMOVE ROLE
    // =========================

    if (command === "removerole") {

      if (
        !interaction.member.permissions.has(
          PermissionsBitField.Flags.ManageRoles
        )
      ) {
        return interaction.reply({
          content: "❌ ما عندك صلاحية إدارة الرتب.",
          ephemeral: true
        });
      }

      const user =
        interaction.options.getUser("user");

      const role =
        interaction.options.getRole("role");

      const member =
        await interaction.guild.members.fetch(user.id);

      if (role.position >= interaction.member.roles.highest.position) {
        return interaction.reply({
          content: "❌ ما تقدر تزيل رتبة أعلى من رتبتك.",
          ephemeral: true
        });
      }

      if (role.position >= interaction.guild.members.me.roles.highest.position) {
        return interaction.reply({
          content: "❌ رتبة البوت أقل من هذه الرتبة.",
          ephemeral: true
        });
      }

      await member.roles.remove(role);

      return interaction.reply(
        `✅ تم إزالة ${role} من **${user.tag}**`
      );
    }

    // =========================
    // NICK
    // =========================

    if (command === "nick") {

      if (
        !interaction.member.permissions.has(
          PermissionsBitField.Flags.ManageNicknames
        )
      ) {
        return interaction.reply({
          content: "❌ ما عندك صلاحية تغيير الألقاب.",
          ephemeral: true
        });
      }

      const user =
        interaction.options.getUser("user");

      const nickname =
        interaction.options.getString("nickname");

      const member =
        await interaction.guild.members.fetch(user.id);

      if (!member.manageable) {
        return interaction.reply({
          content: "❌ ما أقدر أغير لقب هذا العضو.",
          ephemeral: true
        });
      }

      await member.setNickname(nickname);

      return interaction.reply(
        `✅ تم تغيير لقب **${user.tag}** إلى **${nickname}**`
      );
    }

  } catch (error) {

    console.error(error);

    if (interaction.replied || interaction.deferred) {
      return interaction.followUp({
        content: "❌ حدث خطأ أثناء تنفيذ الأمر.",
        ephemeral: true
      });
    }

    return interaction.reply({
      content: "❌ حدث خطأ أثناء تنفيذ الأمر.",
      ephemeral: true
    });
  }

});

// =========================
// تسجيل الدخول
// =========================

client.login(TOKEN);
