from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0106_alter_parametersetplayer_exchange_rate'),
    ]

    operations = [
        migrations.AddField(
            model_name='parametersetperiod',
            name='block_number',
            field=models.IntegerField(default=1, verbose_name='Block Number'),
        ),
    ]