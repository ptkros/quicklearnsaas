import smtplib, confreader

##########
# CONFIG #
##########

# obtain configuration parameters
config = confreader.get_config()['Notification']

# email server
mail_server = config['Server']
mail_port = int(config['Port'])
sender_address = config['Address']
sender_address_password = config['Password']
sender_name = config['Name']

def notify_termination(receiver_address, endpoint_address, session_name, start_datetime):
    message = 'From: %s <%s>\n' % (sender_name, sender_address)
    message += 'To: <%s>\n' % receiver_address
    message += 'Subject: [QUICKLEARN] Session terminated\n\n'
    message += 'Dear user,\n'
    message += 'the session %s that you triggered on %s is terminated.\n' % (session_name, start_datetime.strftime('%A, %d %B %Y at %H:%M:%S'))
    message += 'You can get the results by visiting the following link:\n'
    message += '%s/static/pages/train-session-details.html?session_name=%s\n\n' % (endpoint_address, session_name)
    message += 'QuickLearn SaaS team.\n\n'
    message += 'NOTE: the content of this email is generated automatically. Please, do not reply.'
    smtpserver = smtplib.SMTP(mail_server, mail_port)
    smtpserver.ehlo()
    smtpserver.starttls()
    smtpserver.ehlo()
    smtpserver.login(sender_address, sender_address_password)
    smtpserver.sendmail(sender_address, receiver_address, message)
    smtpserver.quit()