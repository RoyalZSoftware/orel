import os
from flask import Flask, redirect, url_for, render_template, request, session
from sqlalchemy import create_engine, Column, Integer, String, Text
from sqlalchemy.orm import declarative_base, sessionmaker
from authlib.integrations.flask_client import OAuth
from dotenv import load_dotenv
from authlib.common.security import generate_token
from werkzeug.middleware.proxy_fix import ProxyFix

load_dotenv()

# Flask Setup
app = Flask(__name__)
app.secret_key = os.getenv("SECRET_KEY")

app.wsgi_app = ProxyFix(app.wsgi_app, x_proto=1)

# OAuth/Zitadel Setup
oauth = OAuth(app)
zitadel = oauth.register(
    name='zitadel',
    client_id=os.getenv("ZITADEL_CLIENT_ID"),
    client_secret=os.getenv("ZITADEL_CLIENT_SECRET"),
    server_metadata_url=os.getenv("ZITADEL_DISCOVERY_URL"),
    client_kwargs={"scope": "openid profile email urn:zitadel:iam:org:id:327846541618315266",         'code_challenge_method': 'S256' },
    redirect_uri=os.getenv("ZITADEL_REDIRECT_URI")
)

# SQLAlchemy Setup
Base = declarative_base()

class Todo(Base):
    __tablename__ = 'todos'
    id = Column(Integer, primary_key=True)
    user_email = Column(String(255))
    title = Column(String(255))
    description = Column(Text)

DATABASE_URL = f"postgresql://{os.getenv('DB_USER')}:{os.getenv('DB_PASS')}@" \
               f"{os.getenv('DB_HOST')}:{os.getenv('DB_PORT')}/{os.getenv('DB_DATABASE')}"
engine = create_engine(DATABASE_URL)
Base.metadata.create_all(engine)
DBSession = sessionmaker(bind=engine)

# === Routes ===
@app.route('/')
def index():
    if 'user' not in session:
        return redirect(url_for('login'))
    db = DBSession()
    print(session['user'])
    todos = db.query(Todo).filter_by(user_email=session['user']['email']).all()
    return render_template('index.html', todos=todos, user=session['user'])

@app.route('/login')
def login():
    redirect_uri = url_for('auth_callback', _external=True)
    # nonce erzeugen
    nonce = generate_token()
    session['nonce'] = nonce
    return zitadel.authorize_redirect(redirect_uri, nonce=nonce)

@app.route('/auth/callback')
def auth_callback():
    token = zitadel.authorize_access_token()
    nonce = session.pop('nonce', None)
    userinfo = zitadel.parse_id_token(token, nonce=nonce)
    session['user'] = userinfo
    return redirect('/')

@app.route('/logout')
def logout():
    session.clear()
    return redirect('/')

@app.route('/add', methods=['POST'])
def add():
    if 'user' not in session:
        return redirect('/login')
    title = request.form['title']
    description = request.form['description']
    db = DBSession()
    todo = Todo(user_email=session['user']['email'], title=title, description=description)
    db.add(todo)
    db.commit()
    return redirect('/')

# Run
if __name__ == '__main__':
    app.run(debug=True)
